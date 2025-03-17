/* eslint-disable no-undef */
importScripts("/flamapy/flamapy.js");
async function loadFlamapyWorker() {
  self.flamapy = new Flamapy();
  await self.flamapy.loadFlamapy();
}
let flamapyReadyPromise = loadFlamapyWorker()
  .then(() => self.postMessage({ status: "loaded" }))
  .catch((exception) => self.postMessage({ status: "error", exception }));

self.onmessage = async (event) => {
  await flamapyReadyPromise;
  const { action, data, ...context } = event.data;
  for (const key of Object.keys(context)) {
    self[key] = context[key];
  }
  try {
    let results;
    if (action === "importModel") {
      results = await self.flamapy.importModel(
        data.fileExtension,
        data.fileContent
      );
    } else if (action === "startConfigurator") {
      results = await self.flamapy.startConfigurator();
    } else if (action === "answerQuestion") {
      results = await self.flamapy.answerQuestion(data);
    } else if (action === "undoAnswer") {
      results = await self.flamapy.undoAnswer();
    }

    self.postMessage({ results, action });
  } catch (error) {
    console.error(error);
    self.postMessage({ error: error.message, action });
  }
};
