/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
importScripts("/pyodide/pyodide.js");

class Flamapy {
  constructor() {
    this.pyodide = null;
    this.isValid = false;
  }

  async loadFlamapy() {
    const pythonFile = await fetch("/flamapy/flamapy_configurator.py");
    const pyodideInstance = await loadPyodide({
      indexURL: "pyodide",
    });
    await pyodideInstance.loadPackage("micropip");
    await pyodideInstance.loadPackage("python-sat");
    await pyodideInstance.runPythonAsync(`
  import micropip
  await micropip.install("flamapy/flamapy-2.0.1-py3-none-any.whl", deps=False)
  await micropip.install("flamapy/flamapy_fw-2.0.1-py3-none-any.whl", deps=False)
  await micropip.install("flamapy/flamapy_fm-2.0.1-py3-none-any.whl", deps=False)
  await micropip.install("flamapy/flamapy_sat-2.0.1-py3-none-any.whl", deps=False)
  await micropip.install("flamapy/flamapy_bdd-2.0.1-py3-none-any.whl", deps=False)
  await micropip.install("flamapy/dd-0.5.7-py3-none-any.whl", deps=False)
  await micropip.install("flamapy/ply-3.11-py2.py3-none-any.whl", deps=False)
  await micropip.install("flamapy/astutils-0.0.6-py3-none-any.whl", deps=False)
  await micropip.install("flamapy/graphviz-0.20-py3-none-any.whl", deps=False)
  await micropip.install("flamapy/uvlparser-2.0.1-py3-none-any.whl", deps=False)
  await micropip.install("flamapy/afmparser-1.0.3-py3-none-any.whl", deps=False)
  await micropip.install("flamapy/antlr4_python3_runtime-4.13.1-py3-none-any.whl", deps=False)
  await micropip.install("flamapy/flamapy_configurator-2.0.1-py3-none-any.whl", deps=False)
  `);
    await pyodideInstance.runPythonAsync(await pythonFile.text());
    pyodideInstance.FS.mkdir("export");

    this.pyodide = pyodideInstance;
  }

  async importModel(fileExtension, fileContent) {
    this.pyodide.globals.set("file_content", fileContent);
    const result = await this.pyodide.runPythonAsync(
      `
  execute_import_transformation('${fileExtension}', file_content)
        `
    );
    return result;
  }

  async startConfigurator() {
    const result = await this.pyodide.runPythonAsync(`
  start_configurator()`);
    return JSON.parse(result);
  }

  async answerQuestion(answer) {
    this.pyodide.globals.set("answer", answer);
    const result = await this.pyodide.runPythonAsync(`
  answer_question(answer)`);
    return JSON.parse(result);
  }
}
