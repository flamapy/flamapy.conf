import json, os
from flamapy.core.discover import DiscoverMetamodels
from flamapy.metamodels.fm_metamodel.transformations import GlencoeReader, AFMReader, FeatureIDEReader, JSONReader, XMLReader, UVLReader
from flamapy.metamodels.configurator_metamodel.transformation import FmToConfigurator
from collections import defaultdict

fm = None
configurator = None

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

def start_configurator():
    global configurator
    configurator = FmToConfigurator(fm).transform()
    configurator.start()
    
    return json.dumps(configurator.get_current_status())

def answer_question(answer):
    valid = configurator.answer_question(answer)

    result = dict()
    result['valid'] = valid
    if valid:
        if configurator.is_last_question():
            result['configuration'] = configurator._get_configuration()
        else:
            configurator.next_question()
            result['nextQuestion'] = configurator.get_current_status()
        
    else:
        result['contradiction'] = {'msg': 'The selected choice is incompatible with the model definition. Please choose another option.'}
    
    return json.dumps(result)