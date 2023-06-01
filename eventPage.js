
const contextMenuItem = {
  id: "JobDescription",
  title: "Make CoverLetter for this Job role",
  contexts: ["selection"],
};
console.log("Context menu created");
chrome.contextMenus.create(contextMenuItem);

let selectedText;
let TextResume;
let CoverLetter;

chrome.storage.local.get(['resume'], function(result) {
  TextResume = result.resume;
  console.log(TextResume);
});

chrome.contextMenus.onClicked.addListener(function(clickedData, tab) {
  if (clickedData.menuItemId === "JobDescription" && clickedData.selectionText) {
    console.log("Context menu started");
    selectedText = clickedData.selectionText;
    console.log("Selected text: " + selectedText);

    if (selectedText && TextResume) {
      const prompt1 =
        "Write a formal, grammatically correct cover letter based solely on the information from my resume and the relevant details provided in the job description\n\n My resume: \n\n " +
        TextResume +
        "\n\n job description:\n\n" +
        selectedText;
      var popup = window.open(
        "CoverLetter.html",
        "CoverLetterPopup",
        "width=700,height=300"
      ); // open loading animation in the popup window
      const payload = {
        model: "text-davinci-003",
        temperature: 0.9,
        max_tokens: 2324,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false,
        n: 1,
      };

      const apiKey = "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"; // Replace with your actual API key

      fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(Object.assign(payload, { prompt: prompt1 })),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          CoverLetter = data.choices[0].text.trim();
          console.log(CoverLetter);

          // Replace the contents of the popup window with the actual cover letter
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
              const textarea = document.createElement("textarea");
              textarea.id = "CoverLetter";
              textarea.style.width = "100%";
              textarea.style.height = "300px";
              textarea.value = CoverLetter;
              document.body.appendChild(textarea);
            },
          });
        });
    } else {
      console.log("ERROR");
    }
  }
});
