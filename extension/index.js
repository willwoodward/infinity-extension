const summaryButton = document.getElementById('summarise');
const summariseAgainButton = document.getElementById('summarise_again');
const afterClick = document.getElementById("after_click");
const outputP = document.getElementById("output");
const traderMode = document.getElementById("trader_mode");
const stevenBradley = document.getElementById("steven_bradley");
const APIKey = "";

summariseAgainButton.addEventListener('click', async function () {
    summaryButton.classList.remove("clicked");
    afterClick.classList.remove("clicked");
    outputP.innerHTML = "Loading...";
});

summaryButton.addEventListener('click', async function () {
    summaryButton.classList.add("clicked");
    afterClick.classList.add("clicked");

    // if (traderMode.checked) {
    //     stevenBradley.style.display = "block";
    // } else {
    //     stevenBradley.style.display = "none";
    // }

    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    console.log(tab.url);

    // Remove all knowledgebases
    const docs = await fetch("https://api.voiceflow.com/v3alpha/knowledge-base/docs", {
        method: "GET",
        headers: {
            "Authorization" : APIKey,
            "Content-Type": "application/json",
        }
    })
    const docsData = await docs.json().then(data => data.data);
    const docIDs = docsData.map(doc => doc.documentID);

    for (let i = 0; i < docIDs.length; i++) {
        await fetch(`https://api.voiceflow.com/v3alpha/knowledge-base/docs/${docIDs[i]}`, {
            method: "DELETE",
            headers: {
                "Authorization" : APIKey,
                "Content-Type": "application/json",
            }
        });
    }

    // Upload website url to Voiceflow
    await fetch(`https://api.voiceflow.com/v3alpha/knowledge-base/docs/upload`, {
        method: "POST",
        headers: {
            "Authorization" : APIKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(
            {
                "data": {
                    "type": "url",
                    "url": tab.url,
                    "name": tab.url
                }
            }
        )
    });

    setTimeout(async () => {
        if (traderMode.checked) {
            const query = await fetch(`https://general-runtime.voiceflow.com/knowledge-base/query`, {
                method: "POST",
                headers: {
                    "Authorization": APIKey,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    {
                        "question": `Identify the companies mentioned in the document and the return sentiment towards it (positive, negative or neutral). Then write a sentence explaining why, prioritising financial impact and earnings in one very short sentence.`,
                        "chunkLimit": 2,
                        "settings": {
                            "model": "claude-2",
                            "temperature": 0.1,
                            "system": "Always summarize your response to be as brief as possible."
                        }
                    }
                )
            });
            const queryData = await query.json();
            outputP.innerHTML = queryData.output ?? "I'm sorry, I don't understand. Please try again.";
        } else {
            // Query Knowledge base
            let responseSize = document.getElementById("summary_length").value;
            if (responseSize === "short") {
                responseSize = 1;
            } else if (responseSize === "meduim") {
                responseSize = 2;
            } else {
                responseSize = 3;
            }

            const query = await fetch(`https://general-runtime.voiceflow.com/knowledge-base/query`, {
                method: "POST",
                headers: {
                    "Authorization": APIKey,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    {
                        "question": `Summarise the text in ${responseSize} sentences.`,
                        "chunkLimit": 2
                    }
                )
            });
            const queryData = await query.json();
            outputP.innerHTML = queryData.output ?? "I'm sorry, I don't understand. Please try again.";
        }
    }, 4000)
})

const submit = document.getElementById('submit');
const input = document.getElementById('text_input');

submit.addEventListener('click', async () => {
    const question = input.value;
    input.value = "";

    const query = await fetch(`https://general-runtime.voiceflow.com/knowledge-base/query`, {
        method: "POST",
        headers: {
            "Authorization": "VF.DM.6547779505b9a0000748a7bd.xk4EPGfGv7w8JVQl",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(
            {
                "question": question,
                "chunkLimit": 2
            }
        )
    });
    const queryData = await query.json();
    outputP.innerHTML = queryData.output ?? "I'm sorry, I don't understand. Please try again.";
})
