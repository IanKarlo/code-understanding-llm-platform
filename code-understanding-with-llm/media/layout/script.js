const APP_KEY = "";

document.getElementById("explainSelection").addEventListener("click", () => {
  vscode.postMessage({ command: "explainSelection" });
});

document.getElementById("explainFile").addEventListener("click", () => {
  vscode.postMessage({ command: "getFileContent" });
});

document.getElementById("explainRepo").addEventListener("click", () => {
  vscode.postMessage({ command: "explainRepo" });
});

document.getElementById("sendQuestion").addEventListener("click", () => {
  sendQuestion();
});

document.getElementById("askRepo").addEventListener("click", () => {
  const input = document.getElementById("questionInput");
  const questionText = input.value.trim();

  if (questionText.length === 0) {
    appendResposta("Por favor, digite uma pergunta.", true);
    return;
  }
  
  vscode.postMessage({ command: "askRepo" });
});

document.getElementById("clear").addEventListener("click", () => {
  document.getElementById('chat-container').innerHTML = ""
})

document
  .getElementById("questionInput")
  .addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Impede pular linha
      sendQuestion();
    }
  });

function sendQuestion() {
  const input = document.getElementById("questionInput");
  const questionText = input.value.trim();

  if (questionText) {
    appendSubtitle("Pergunta:");
    appendResposta(questionText);

    toggleButtons(false);
    showLoading(true);
    input.disabled = true;
    axios
      .post(
        "http://localhost:3000/api/ask",
        {
          question: questionText,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": APP_KEY,
          },
        }
      )
      .then((response) => {
        const resposta = response.data.answer;
        appendSubtitle("Resposta:");
        appendResposta(resposta, true); // ← se for markdown
        input.focus();
      })
      .catch((error) => {
        appendResposta("❌ Erro ao buscar resposta.", true);
      })
      .finally(() => {
        toggleButtons(true);
        showLoading(false);
        input.disabled = false;
        input.value = "";
      });
  }
}

function toggleButtons(enabled) {
  const buttons = document.querySelectorAll("button");
  buttons.forEach((btn) => {
    btn.disabled = !enabled;
  });
}

function showLoading() {
  let loader = document.getElementById("loading-indicator");

  if (!loader) {
    loader = document.createElement("p");
    loader.id = "loading-indicator";
    loader.textContent = "⏳ Carregando...";
    loader.style.marginTop = "16px";
    loader.style.fontStyle = "italic";
    loader.style.color = "#aaa";
    document.getElementById("chat-container").appendChild(loader);
  } else {
    loader.remove();
  }
}

function showLoadingRepo() {
  let loader = document.getElementById("loading-indicator-repo");

  if (!loader) {
    loader = document.createElement("p");
    loader.id = "loading-indicator-repo";
    loader.textContent = "⏳ Lendo arquivos do repositório...";
    loader.style.marginTop = "16px";
    loader.style.fontStyle = "italic";
    loader.style.color = "#aaa";
    document.getElementById("chat-container").appendChild(loader);
  } else {
    loader.remove();
  }
}

function appendSubtitle(text) {
  const divider = document.createElement("hr");
  const subtitle = document.createElement("h3");
  subtitle.style.marginTop = "16px";
  subtitle.textContent = text;
  document.getElementById("chat-container").appendChild(divider);
  document.getElementById("chat-container").appendChild(subtitle);
}

function appendResposta(text, isMarkdown = false) {
  const main = document.getElementById("chat-container");

  const container = document.createElement("div");
  container.style.marginTop = "12px";
  container.style.fontSize = "16px";
  container.style.textAlign = "left";

  if (isMarkdown) {
    container.innerHTML = marked.parse(text); // renderiza Markdown em HTML
  } else {
    container.textContent = text;
  }

  main.appendChild(container);
}

window.addEventListener("message", (event) => {
  const message = event.data;

  switch (message.command) {
    case "sendFileContentToBackend":
      const fileContent = message.text;

      appendSubtitle("Solicitação de análise de um arquivo.");
      appendResposta(
        `Enviado conteúdo do arquivo **${message.fileName}** para análise.`,
        true
      );

      toggleButtons(false);
      showLoading(true);

      axios
        .post(
          "http://localhost:3000/api/explain-file",
          {
            fileContent,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": APP_KEY,
            },
          }
        )
        .then((response) => {
          const resposta = response.data.answer;
          appendSubtitle("Resposta:");
          appendResposta(resposta, true);
        })
        .catch((error) => {
          appendResposta("❌ Erro ao enviar o conteúdo do arquivo.");
        })
        .finally(() => {
          toggleButtons(true);
          showLoading(false);
        });

      break;
    case "sendSelectedTextToBackend":
      const selectedText = message.text;

      appendSubtitle("Solicitação de análise do seguinte trecho de código:");
      appendResposta(selectedText, true);

      toggleButtons(false);
      showLoading(true);

      axios
        .post(
          "http://localhost:3000/api/explain",
          {
            code: selectedText,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": APP_KEY,
            },
          }
        )
        .then((response) => {
          const resposta = response.data.answer;
          appendSubtitle("Resposta:");
          appendResposta(resposta, true);
        })
        .catch((error) => {
          appendResposta("❌ Erro ao enviar o trecho selecionado.");
        })
        .finally(() => {
          toggleButtons(true);
          showLoading(false);
        });

      break;
    case "sendRepoContentToBackend":
      showLoadingRepo();
      appendSubtitle("Solicitação de análise do repositório completo.");
      appendResposta(
        "Enviado conteúdo completo do repositório para análise.",
        true
      );

      showLoading(true);

      axios
        .post(
          "http://localhost:3000/api/explain-multiple",
          {
            filesContent: message.text,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": APP_KEY,
            },
          }
        )
        .then((response) => {
          const resposta = response.data.answer;
          appendSubtitle("Resposta:");
          appendResposta(resposta, true);
        })
        .catch((error) => {
          appendResposta("❌ Erro ao enviar o conteúdo do repositório.");
        })
        .finally(() => {
          toggleButtons(true);
          showLoading(false);
        });

      break;
    case 'sendAskRepoToBackend':
      const input = document.getElementById("questionInput");
      const questionText = input.value.trim();
      
      showLoadingRepo();
      appendSubtitle("Busca nas informações do repositório completa.");
      appendResposta(
        "Enviada pergunta ao repositório.",
        true
      );

      appendSubtitle("Pergunta:");
      appendResposta(questionText);
      input.disabled = true;
      showLoading(true);

      axios
        .post(
          "http://localhost:3000/api/ask-repo",
          {
            question: questionText,
            filesContent: message.text
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": APP_KEY,
            },
          }
        )
        .then((response) => {
          const resposta = response.data.answer;
          appendSubtitle("Resposta:");
          appendResposta(resposta, true);
        })
        .catch((error) => {
          appendResposta("❌ Erro ao fazer a pergunta.");
        })
        .finally(() => {
          toggleButtons(true);
          showLoading(false);
          input.value = "";
          input.disabled = false;
        });
        
        break;

    case "repoLoading":
      showLoadingRepo();
      toggleButtons(false);
      break;
  }
});

// API para comunicação com o VS Code
const vscode = acquireVsCodeApi();
