import json, os
from flamapy.interfaces.python import FLAMAFeatureModel
from flamapy.core.exceptions import FlamaException
from antlr4 import CommonTokenStream, FileStream
from uvl.UVLCustomLexer import UVLCustomLexer
from uvl.UVLPythonParser import UVLPythonParser
from antlr4.error.ErrorListener import ErrorListener
from flamapy.core.discover import DiscoverMetamodels
from flamapy.metamodels.fm_metamodel.transformations import GlencoeReader, AFMReader, FeatureIDEReader, JSONReader, XMLReader, UVLReader, GlencoeWriter
from flamapy.metamodels.configuration_metamodel.models import Configuration
from collections import defaultdict

fm = None
configurator = None

def execute_import_transformation(file_extension: str, file_content: str):
    with open("import.{}".format(file_extension), "w") as text_file:
        text_file.write(file_content)
    dm = DiscoverMetamodels()
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
        result = dm.use_transformation_m2t(feature_model,'import.uvl')
        global fm
        fm = result
        os.remove("import.uvl")
        return result
    else:
        raise Exception("not_supported")

def start_configurator():
    global configurator
    configurator = FmToConfigurator(fm).transform()
    configurator.start()
    first_question = configurator.get_current_question()
    options = configurator.get_possible_options()
    result = {'question': first_question.name, 'options': [opt.name for opt in options ]}

    return json.dumps(result)