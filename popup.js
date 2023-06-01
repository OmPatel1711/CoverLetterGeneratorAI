

var form = document.getElementById('resume-form');
var status = document.getElementById('status');
var resetBtn = document.getElementById('reset');
console.log(form);
let alltext = '';



// Add a submit event listener to the form
form.addEventListener('submit', function(event) {
  // Prevent the form from submitting normally
  console.log("Form submitted");
  event.preventDefault();

  // Check if the resume is already uploaded
  chrome.storage.local.get('resume', function(data) {
    if (data.resume) {
      // Display an error message
      console.log("Already have resume");
      document.getElementById("status").innerHTML = 'You have already uploaded a resume.';
    } else {
      // Get the selected file from the file input field
      console.log("uploading new resume");
      var file = document.getElementById('resume').files[0];
      console.log("New resume uploaded");

      // Create a new FileReader object to read the file
      var reader = new FileReader();

      // Set the onloadend event listener for the reader object
      reader.onloadend = function() {
        // Get the file content as a string
        var content = reader.result;


        // Store the file content in the Chrome storage
        chrome.storage.local.set({'resume': content}, function() {
          // Display a success message
          console.log("Resume uploaded successfully");
          document.getElementById("status").innerHTML = "Resume uploaded successfully.";

          
          chrome.storage.local.get('resume', function(data) {
            if (data.resume) {
              // Check if the stored content is a PDF file
              var isPDF = data.resume.substring(0, 4) === '%PDF';
              if (isPDF) {
                console.log('The stored file is a PDF.');

                let fr = new FileReader();
                fr.readAsDataURL(file)
                fr.onload=()=> {

                  let res = fr.result;
                  extractText(res)

                  chrome.storage.local.set({ 'resume': alltext }, function() {
                    // Display a success message
                    console.log("Text Resume uploaded successfully", alltext);
                  });
                  

                }

              } else {
                console.log('The stored file is not a PDF.');
              }
            } else {
              console.log('No resume found in storage.');
            }
          });

        });
      };

      // Read the file as text
      reader.readAsText(file);
    }
  });
});

// Add a click event listener to the reset button
resetBtn.addEventListener('click', function() {
  // Remove the resume from the Chrome storage
  chrome.storage.local.remove('resume', function() {
    // Display a success message
    console.log("Resume removed");
    document.getElementById("status").innerHTML = "Resume reset successfully.";
  });
});


// Text Converter

async function extractText(url){
let pdf;
 
pdf = await pdfjsLib.getDocument(url).promise;
console.log(pdf); 


let pages = pdf.numPages;

for (let i = 1; i <= pages; i++) {
  let page = await pdf.getPage(i)
  let txt = await page.getTextContent();
  //console.log(txt);

  let text = txt.items.map((s) => s.str).join("");
  formatText(text);


  
  alltext += text;

  console.log(text);

}

chrome.storage.local.set({ 'resume': alltext }, function() {
  // Display a success message
  console.log("Text Resume uploaded successfully");
  console.log(alltext);
});


}

function formatText(text) {
  // Remove page numbers
  text = text.replace(/(\d+)\n/g, '');

  // Remove multiple whitespace and line breaks
  text = text.replace(/\s+/g, ' ').replace(/\n+/g, '\n');

  // Add line breaks after periods and other punctuation marks
  text = text.replace(/([.?!])\s+(?=[A-Z])/g, '$1\n\n');

  // Add indentation to new paragraphs
  text = text.replace(/\n([A-Z])/g, '\n\n  $1');

  // Remove leading and trailing whitespace
  text = text.trim();

  // Remove specific characters
  text = text.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

  return text;
}

