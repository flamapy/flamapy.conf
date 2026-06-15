import json, os
from flamapy.core.discover import DiscoverMetamodels
from flamapy.metamodels.fm_metamodel.transformations import GlencoeReader, AFMReader, FeatureIDEReader, JSONReader, XMLReader, UVLReader
from flamapy.metamodels.configurator_metamodel.transformation import FmToConfiguratorPreOrder
from flamapy.metamodels.configurator_metamodel.operations.configure import Configure

fm = None
configurator_model = None
configure_op = None

def execute_import_transformation(file_extension: str, file_content: str):
    with open("import.{}".format(file_extension), "w") as text_file:
        text_file.write(file_content)
    feature_model = False
    match(file_extension):
        case 'gfm.json':
            feature_model = GlencoeReader("import.gfm.json").transform()
            os.remove("import.gfm.json")
        case 'afm':
            feature_model = AFMReader("import.afm").transform()
            os.remove("import.afm")
        case 'fide':
            feature_model = FeatureIDEReader("import.fide").transform()
            os.remove("import.fide")
        case 'json':
            feature_model = JSONReader("import.json").transform()
            os.remove("import.json")
        case 'xml':
            feature_model = XMLReader("import.xml").transform()
            os.remove("import.xml")
        case 'uvl':
            feature_model = UVLReader("import.uvl").transform()
            os.remove("import.uvl")
    
    if(feature_model):
        global fm
        fm = feature_model
        return True
    else:
        raise Exception("not_supported")

def _serialize(obj):
    """Helper to serialize objects like Enums for JSON."""
    if hasattr(obj, 'value'):
        return obj.value
    return str(obj)

def _get_serializable_status():
    """Get status and ensure it's JSON serializable."""
    status = configure_op.get_current_status()
    # Serialize FeatureType enums in possibleOptions
    question_attrs = configurator_model.questions[configurator_model.current_question_index].feature.get_attributes()

    if len(question_attrs) >= 1:
        status["currentQuestionAttrs"] = { a.get_name(): a.get_default_value() for a in question_attrs}

    if 'possibleOptions' in status:
        possible = configure_op.get_possible_options()
        status["possibleOptions"] = [
                {'id': n, 'name': o.name, 'featureType': _serialize(o.feature.feature_type), 'optionAttrs': {a.get_name(): a.get_default_value() for a in o.feature.get_attributes()}}
                for n, o in enumerate(possible)
            ]
                
    return status

def start_configurator():
    global configurator_model, configure_op
    configurator_model = FmToConfiguratorPreOrder(fm, solver='z3').transform()
    
    configure_op = Configure()
    configure_op.execute(configurator_model)
    configure_op.start()
    
    return json.dumps(_get_serializable_status())

def answer_question(answer):
    # answer is expected to be a dict {name: value} from the JS client
    # If it comes from Pyodide as a JsProxy, convert it.
    if hasattr(answer, 'to_py'):
        answer = answer.to_py()
        
    valid = configure_op.answer_question(answer)
    result = dict()
    result['valid'] = valid
    
    if valid:
        # We need to peek if we are finished.
        configure_op.next_question()
        if configure_op.is_finished():
            raw_configuration = configure_op._get_configuration()
            string_features = [f.name for f in fm.get_string_features()]
            
            # Iterate and modify string features that are True to be ""
            processed_config = {}
            for feature, value in raw_configuration.items():
                if feature in string_features and value is True:
                    processed_config[feature] = ""
                else:
                    processed_config[feature] = value
                    
            result['configuration'] = processed_config
        else:
            result['nextQuestion'] = _get_serializable_status()
    else:
        result['contradiction'] = {
            'msg': 'The selected choice is incompatible with the model definition. Please choose another option.'
        }
    
    return json.dumps(result)

    configure_op.previous_question()
    return json.dumps(_get_serializable_status())

def generate_artifact(model_extension, model_content, configuration, template_content):
    # 1. Write the model file to the virtual filesystem
    model_filename = f"model.{model_extension}"
    with open(model_filename, "w") as f:
        f.write(model_content)

    # 2. Write the configuration to a JSON file
    # Ensure configuration is a dictionary and save it
    if hasattr(configuration, 'to_py'):
        configuration = configuration.to_py()
    
    config_filename = "config.json"
    with open(config_filename, "w") as f:
        json.dump(configuration, f)

    print(configuration)
    # 3. Write the template to a file
    template_filename = "prompt_template.txt_es.jinja"
    with open(template_filename, "w") as f:
        f.write(template_content)
    
    # 4. Initialize UVEngine
    # The UVEngine expects paths to the files
    from uvengine import UVEngine
    
    # We might need to handle the fact that UVEngine expects a list of configs/templates
    uvengine = UVEngine(
        feature_model_path=model_filename,
        configs_path=[config_filename],
        templates_paths=[template_filename],
        mapping_model_filepath=None
    )
    
    # 5. Resolve
    # resolve_variability returns a dictionary where keys are template paths and values are the resolved content
    resolved = uvengine.resolve_variability()
    print(resolved)

    
    # Extract the content for our specific template
    # The key in resolved dict should be the path we passed
    generated_text = resolved.get(template_filename, "")
    
    print(generated_text)
    # Optimization/Cleanup: remove temporary files to keep the worker clean? 
    # Not strictly necessary in this ephemeral env but good practice.
    # os.remove(model_filename)
    # os.remove(config_filename)
    # os.remove(template_filename)

    return generated_text
