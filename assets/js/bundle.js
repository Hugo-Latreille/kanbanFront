(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dragOther = _interopRequireDefault(require("./dragOther.js"));

var _index = _interopRequireDefault(require("./index.js"));

var _tags = _interopRequireDefault(require("./tags.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import initDrag from "./dragdrop.js";
// import initOtherDrag from "./dragOther.js";
const card = {
  showAddCardModal(e) {
    let listId = e.target.closest(".panel");
    listId = listId.getAttribute("data-list-id");
    const modale = document.getElementById("addCardModal");
    const inputListId = modale.querySelector('[name="list-id"]');
    inputListId.setAttribute("value", `${listId}`);
    modale.classList.add("is-active");
    modale.querySelector("input[name='content']").value = "";
    const cardForm = document.querySelector("#addCardModal form");
    cardForm.addEventListener("submit", card.handleAddCardForm);
  },

  hideCardModals() {
    const closeModale = document.getElementById("addCardModal");
    closeModale.classList.remove("is-active");
  },

  async handleAddCardForm(e) {
    try {
      e.preventDefault();
      const formData = new FormData(e.target);
      const newName = formData.get("content");
      const colorData = formData.get("color");
      const listId = formData.get("list-id");
      const thisList = document.querySelector(`[data-list-id="${listId}"]`);
      const newCardPosition = thisList.querySelectorAll(".box").length + 1;
      formData.set("position", newCardPosition);
      formData.set("list_id", listId);
      const response = await fetch(`${_index.default.base_url}/cards`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Problème avec le POST" + response.status);
      }

      const data = await response.json();
      console.log(newName);
      card.makeCardInDOM(newName, listId, colorData, data.id, newCardPosition);
      card.hideCardModals();
    } catch (error) {
      console.error(error);
    }
  },

  async getCardsFromAPI(listId) {
    try {
      const response = await fetch(`${_index.default.base_url}/cards`);

      if (!response.ok) {
        throw new Error("Impossible de récupérer les cartes");
      }

      const cardsData = await response.json();
      const cardsInList = cardsData.filter(card => card.list_id === listId);
      cardsInList.forEach(oneCard => {
        card.makeCardInDOM(oneCard.content, oneCard.list_id, oneCard.color, oneCard.id, oneCard.position, oneCard.tags);

        _index.default.addListenerToActions();
      });
    } catch (error) {
      console.error(error);
    }
  },

  makeCardInDOM(newName, listId, colorData, dataId, newCardPosition, tagsFromCard) {
    const list = document.querySelector(`[data-list-id="${listId}"]`);
    const firstList = list.querySelector(".panel-block");
    const template = document.querySelector(".newCard");
    const templateContent = template.content;
    const clone = document.importNode(templateContent, true);
    const title = clone.querySelector(".column");
    title.textContent = newName;
    const position = clone.querySelector("input[name='position']");
    position.setAttribute("value", newCardPosition);
    const setListIdInCard = clone.querySelector("input[name='list-id']");
    setListIdInCard.setAttribute("value", listId);
    clone.querySelector(".box").dataset.cardId = dataId;
    clone.querySelector(".box").style.borderColor = colorData;
    const tagsDiv = clone.querySelector(".tags");

    if (tagsFromCard) {
      tagsFromCard.forEach(tag => {
        const tagTemplate = document.querySelector(".newTag");
        const tagClone = document.importNode(tagTemplate.content, true);
        const thisTag = tagClone.querySelector(".tag");
        thisTag.style.backgroundColor = tag.color;
        thisTag.dataset.tagId = tag.id;
        thisTag.querySelector(".tagTitle").innerText = tag.name;
        tagsDiv.appendChild(tagClone);
      });
    }

    firstList.appendChild(clone);

    _index.default.addListenerToActions(); //?Init drag&drop pour chaque carte et transmission d'info


    const thisCard = document.querySelector(`[data-card-id="${dataId}"]`);
    const thisCardId = thisCard.dataset.cardId;
    thisCard.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", thisCardId);
    }); //? Create TopDropZone

    const topDropZone = (0, _dragOther.default)();
    thisCard.after(topDropZone);
    list.querySelectorAll(".delete.is-small").forEach(deleteBtn => {
      deleteBtn.addEventListener("dblclick", _tags.default.removeTagFromCard);
    });
    list.querySelectorAll(".addTag").forEach(tag => {
      tag.addEventListener("dblclick", _tags.default.showAddTagToCardModal);
    });
  },

  editCard(e) {
    const thisCard = e.target.closest(".box");
    const title = thisCard.querySelector(".column");
    title.classList.add("is-hidden");
    const form = thisCard.querySelector("form");
    form.classList.remove("is-hidden");
    thisCard.querySelector(".input.is-small").setAttribute("value", title.textContent); //*update position

    const thisCardPosition = thisCard.querySelector("input[name='position']").value;
    const maxPosition = thisCard.closest(".panel").querySelectorAll(".box").length;
    const selectPosition = thisCard.querySelector(".selectPosition");

    const setSelected = option => {
      return option + 1 === Number(thisCardPosition) ? "selected" : "";
    };

    for (let option = 0; option < maxPosition; option++) {
      selectPosition.innerHTML += `<option value="${option + 1}" ${setSelected(option)}>${option + 1}</option>`;
    }

    form.addEventListener("submit", card.updateCardForm);
  },

  async updateCardForm(e) {
    try {
      e.preventDefault();
      const formData = new FormData(e.target);
      const thisCard = e.target.closest(".box");
      const title = thisCard.querySelector(".column");
      const form = thisCard.querySelector("form");
      const cardId = thisCard.dataset.cardId;
      const thisCardPosition = thisCard.querySelector("input[name='position']").value;
      const newPosition = formData.get("newPosition");
      const listId = thisCard.querySelector("input[name='list-id']").value;
      console.log(listId);
      formData.set("list_id", listId); // if (!thisCardPosition === newPosition)
      //*Update Position only

      const updatePosition = await fetch(`${_index.default.base_url}/cards/${cardId}/position/${newPosition}`, {
        method: "PATCH"
      });
      const updatePositionData = await updatePosition.json();
      console.log(updatePositionData);
      formData.delete("newPosition");
      formData.delete("position");
      const response = await fetch(`${_index.default.base_url}/cards/${cardId}`, {
        method: "PATCH",
        body: formData
      });
      console.log(response);

      if (!response.ok) {
        title.classList.remove("is-hidden");
        form.classList.add("is-hidden");
        throw new Error("Problème avec le PATCH " + response.status);
      }

      const data = await response.json();
      title.classList.remove("is-hidden");
      form.classList.add("is-hidden");
      title.textContent = formData.get("content");
      const findNewColorResponse = await fetch(`${_index.default.base_url}/cards/${cardId}`);
      const findNewColorData = await findNewColorResponse.json();
      thisCard.style.borderColor = findNewColorData.color;
      document.location.reload();
    } catch (error) {
      console.error(error);
    }
  },

  async deleteCard(e) {
    try {
      const confirmation = confirm("Voulez-vous vraiment supprimer cette carte ?");
      if (!confirmation) return;
      const thisCard = e.target.closest(".box");
      const cardId = thisCard.dataset.cardId; //* soit en récup listId et on getCardsFromAPI
      // const thisListId = thisCard.querySelector("input[name='list-id']").value;
      //* soit on supprime directement la card en js

      const parent = thisCard.closest(".panel-block");
      const response = await fetch(`${_index.default.base_url}/cards/${cardId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Problème " + response.status);
      }

      thisCard.remove();
      return console.log(`Carte ${cardId} supprimée de la bdd`);
    } catch (error) {
      console.error(error);
    }
  }

};
var _default = card;
exports.default = _default;

},{"./dragOther.js":2,"./index.js":3,"./tags.js":5}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = _interopRequireDefault(require("./index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createDropZone = () => {
  const range = document.createRange();
  range.selectNode(document.body);
  const dropZone = range.createContextualFragment(`<div class="dropZone"></div>`).children[0];
  dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("is-active");
  });
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("is-active");
  });
  dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("is-active");
    const thisList = dropZone.closest("[data-list-id]");
    const newListId = Number(thisList.dataset.listId);
    const dropZonesInList = [...thisList.querySelectorAll(".dropZone")];
    const dropZoneIndex = dropZonesInList.indexOf(dropZone) + 1;
    const cardId = Number(e.dataTransfer.getData("text/plain"));
    const droppedCardElement = document.querySelector(`[data-card-id="${cardId}"]`).parentElement;
    const thisCardPosition = Number(document.querySelector(`[data-card-id="${cardId}"]`).querySelector("input[name='position']").value);
    const insertAfter = dropZone.parentElement.classList.contains("cardWithDropZone") ? dropZone.parentElement : dropZone; // updateListAndCardsPosition(
    // 	newListId,
    // 	cardId,
    // 	dropZoneIndex,
    // 	thisCardPosition
    // );

    updateListAndCardsPositionSimpler(newListId, cardId, dropZoneIndex); // updateCardsPositionAPI(cardId, dropZoneIndex, newListId, thisCardPosition);

    insertAfter.after(droppedCardElement);
  });
  return dropZone;
}; //* update de toutes les positions dans une même liste : back ok
//* SINON
//* nouvelle < ancienne : on incrémente de 1 la position de toutes les autres cartes de la même liste dont la position est >= nouvelle ET < à l'ancienne
//* nouvelle > ancienne : on décrémente de 1 la position de toutes les autres cartes de la même liste dont la position est > ancienne et <= nouvelle
//* On update la position de cette carte
//? nouvelle < ancienne -> position >= nouvelle && < ancienne -> position +1 -> update position chacune de ces cartes puis la carte
//? nouvelle > ancienne -> position > ancienne && <= nouvelle -> position -1 -> update ces cartes puis la carte
//?Changement de liste :
//? test : update d'abord la dite carte avec nouvelle position / listId puis
//? ancienne liste : -1 toutes les cartes > ancienne position
//? nouvelle liste : + 1 toutes les cartes >= nouvelle position


const updateListAndCardsPosition = async (newListId, cardId, newPosition, oldPosition) => {
  try {
    const newList = document.querySelector(`[data-list-id="${newListId}"]`);
    const allCardsInList = newList.querySelectorAll("[data-card-id]");
    let goodNewPosition = newPosition - 1;

    if (goodNewPosition === 0) {
      goodNewPosition = 1;
    }

    const oldList = await fetch(`${_index.default.base_url}/cards/${cardId}`);

    if (!oldList.ok) {
      throw new Error("Problème avec le GET " + oldList.status);
    }

    const oldListData = await oldList.json();

    if (oldListData.list_id === newListId) {
      console.log("même liste");
      allCardsInList.forEach(async card => {
        const thisCardIds = Number(card.dataset.cardId);
        const oldCardPositions = Number(card.querySelector("input[name='position']").value);

        if (newPosition < oldPosition) {
          if (oldCardPositions >= newPosition && oldCardPositions < oldPosition) {
            const updateCards = await fetch(`${_index.default.base_url}/cards/${thisCardIds}`, {
              method: "PATCH",
              headers: {
                "Content-type": "application/json"
              },
              body: JSON.stringify({
                position: oldCardPositions + 1
              })
            });
            console.log(updateCards);

            if (!updateCards.ok) {
              throw new Error("Problème avec le PATCH " + response.status);
            }

            const updateThisCard = await fetch(`${_index.default.base_url}/cards/${cardId}`, {
              method: "PATCH",
              body: JSON.stringify({
                position: newPosition
              }),
              headers: {
                "Content-type": "application/json"
              }
            });
            console.log(updateThisCard);

            if (!updateThisCard.ok) {
              throw new Error("Problème avec le PATCH " + updateThisCard.status);
            } //! on met à jour la position de la carte sans refresh


            card.querySelector("input[name='position']").setAttribute("value", `${oldCardPositions + 1}`);
            document.querySelector(`[data-card-id="${cardId}"]`).querySelector("input[name='position']").setAttribute("value", `${newPosition}`);
            return;
          }
        }

        if (goodNewPosition > oldPosition) {
          if (oldCardPositions <= goodNewPosition && oldCardPositions > oldPosition) {
            const updateCards = await fetch(`${_index.default.base_url}/cards/${thisCardIds}`, {
              method: "PATCH",
              headers: {
                "Content-type": "application/json"
              },
              body: JSON.stringify({
                position: oldCardPositions - 1
              })
            });
            console.log(updateCards);

            if (!updateCards.ok) {
              throw new Error("Problème avec le PATCH " + response.status);
            }

            const updateThisCard = await fetch(`${_index.default.base_url}/cards/${cardId}`, {
              method: "PATCH",
              body: JSON.stringify({
                position: goodNewPosition //

              }),
              headers: {
                "Content-type": "application/json"
              }
            });
            console.log(updateThisCard);

            if (!updateThisCard.ok) {
              throw new Error("Problème avec le PATCH " + updateThisCard.status);
            }

            card.querySelector("input[name='position']").setAttribute("value", `${oldCardPositions - 1}`);
            document.querySelector(`[data-card-id="${cardId}"]`).querySelector("input[name='position']").setAttribute("value", `${goodNewPosition}`);
            return;
          }
        }
      });
      return;
    }

    if (oldListData.list_id !== newListId) {
      console.log("autre liste");
      const oldList = document.querySelector(`[data-list-id="${oldListData.list_id}"]`);
      const allCardsInOldList = oldList.querySelectorAll("[data-card-id]");
      const updateThisCard = await fetch(`${_index.default.base_url}/cards/${cardId}`, {
        method: "PATCH",
        body: JSON.stringify({
          list_id: newListId
        }),
        headers: {
          "Content-type": "application/json"
        }
      });
      console.log(updateThisCard);

      if (!updateThisCard.ok) {
        throw new Error("Problème avec le PATCH " + updateThisCard.status);
      } //* ANCIENNE LISTE


      allCardsInOldList.forEach(async card => {
        const thisCardId = Number(card.dataset.cardId);
        const oldCardPosition = Number(card.querySelector("input[name='position']").value);

        if (oldCardPosition > oldPosition) {
          console.log(card);
          const updateCards = await fetch(`${_index.default.base_url}/cards/${thisCardId}`, {
            method: "PATCH",
            headers: {
              "Content-type": "application/json"
            },
            body: JSON.stringify({
              position: oldCardPosition - 1
            })
          });
          console.log(updateCards);

          if (!updateCards.ok) {
            throw new Error("Problème avec le PATCH " + response.status);
          } //! on met à jour la position des cartes qui restent sans refresh


          card.querySelector("input[name='position']").setAttribute("value", `${oldCardPosition - 1}`);
        }
      }); //* NOUVELLE LISTE

      allCardsInList.forEach(async card => {
        const thisCardId = Number(card.dataset.cardId);
        const oldCardPosition = Number(card.querySelector("input[name='position']").value);
        console.log(oldCardPosition, newPosition);

        if (oldCardPosition >= newPosition) {
          const updateCards = await fetch(`${_index.default.base_url}/cards/${thisCardId}`, {
            method: "PATCH",
            headers: {
              "Content-type": "application/json"
            },
            body: JSON.stringify({
              position: oldCardPosition + 1
            })
          });
          console.log(updateCards);

          if (!updateCards.ok) {
            throw new Error("Problème avec le PATCH " + response.status);
          } //! on met à jour la position de la carte sans refresh


          card.querySelector("input[name='position']").setAttribute("value", `${oldCardPosition + 1}`);
        }

        const updateThisCardId = await fetch(`${_index.default.base_url}/cards/${cardId}`, {
          method: "PATCH",
          body: JSON.stringify({
            position: newPosition
          }),
          headers: {
            "Content-type": "application/json"
          }
        });
        console.log(updateThisCardId);

        if (!updateThisCardId.ok) {
          throw new Error("Problème avec le PATCH " + updateThisCardId.status);
        }

        document.querySelector(`[data-card-id="${cardId}"]`).querySelector("input[name='position']").setAttribute("value", `${newPosition}`);
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const updateListAndCardsPositionSimpler = async (newListId, cardId, newPosition) => {
  const updateThisCardList = await fetch(`${_index.default.base_url}/cards/${cardId}`, {
    method: "PATCH",
    body: JSON.stringify({
      list_id: newListId
    }),
    headers: {
      "Content-type": "application/json"
    }
  });
  const newList = document.querySelector(`[data-list-id="${newListId}"]`);
  const allCardsInNewList = newList.querySelectorAll(".box");
  const thisCard = document.querySelector(`[data-card-id="${cardId}"]`);
  const oldListId = Number(thisCard.querySelector("input[name='list-id']").value);
  const oldList = document.querySelector(`[data-list-id="${oldListId}"]`);
  const allCardsInOldList = oldList.querySelectorAll("[data-card-id]");
  allCardsInOldList.forEach(async (oldCard, i) => {
    console.log(`je change la carte ${oldCard.dataset.cardId} pour lui mettre la position ${i} et lid de liste ${oldListId}`);
    await fetch(`${_index.default.base_url}/cards/${oldCard.dataset.cardId}`, {
      method: "PATCH",
      body: JSON.stringify({
        position: i + 1
      }),
      headers: {
        "Content-type": "application/json"
      }
    });
  });
  allCardsInNewList.forEach(async (newCard, i) => {
    console.log(`je change la carte ${newCard.dataset.cardId} pour lui mettre la position ${i + 1} et lid de liste ${newListId}`);
    await fetch(`${_index.default.base_url}/cards/${newCard.dataset.cardId}`, {
      method: "PATCH",
      body: JSON.stringify({
        position: i + 1
      }),
      headers: {
        "Content-type": "application/json"
      }
    });
  });
}; //* Update des positions via l'API, dans une même liste


const updateCardsPositionAPI = async (cardId, newPosition, newListId, oldPosition) => {
  let goodNewPosition = newPosition - 1;

  if (goodNewPosition === 0) {
    goodNewPosition = 1;
  }

  console.log(cardId, oldPosition, goodNewPosition, newListId);
  const updatePosition = await fetch(`${_index.default.base_url}/cards/${cardId}/position/${goodNewPosition}`, {
    method: "PATCH"
  });
  const updatePositionData = await updatePosition.json();
  console.log(updatePositionData);
  const updateThisCard = await fetch(`${_index.default.base_url}/cards/${cardId}`, {
    method: "PATCH",
    body: JSON.stringify({
      list_id: newListId
    }),
    headers: {
      "Content-type": "application/json"
    }
  });
  console.log(updateThisCard);

  if (!updateThisCard.ok) {
    throw new Error("Problème avec le PATCH " + updateThisCard.status);
  }

  document.location.reload();
};

var _default = createDropZone;
exports.default = _default;

},{"./index.js":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _list = _interopRequireDefault(require("./list.js"));

var _card = _interopRequireDefault(require("./card.js"));

var _tags = _interopRequireDefault(require("./tags.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const index = {
  init: function () {
    console.log("app.init !");
    index.addListenerToActions();
    index.getListsFromAPI();
  },
  base_url: "http://localhost:5002/api",

  addListenerToActions() {
    const button = document.getElementById("addListButton");
    button.addEventListener("click", _list.default.showAddListModal);
    const listModale = document.getElementById("addListModal");
    listModale.querySelectorAll(".close").forEach(modale => {
      modale.addEventListener("click", _list.default.hideModals);
    });
    const listForm = document.querySelector("#addListModal form");
    listForm.addEventListener("submit", _list.default.handleAddListForm);
    document.querySelectorAll(".addCard.is-small.has-text-white").forEach(icon => {
      icon.addEventListener("click", _card.default.showAddCardModal);
    });
    const cardModale = document.getElementById("addCardModal");
    cardModale.querySelectorAll(".close").forEach(modale => {
      modale.addEventListener("click", _card.default.hideCardModals);
    });
    const editLists = document.querySelectorAll("h2");
    editLists.forEach(editList => {
      editList.addEventListener("dblclick", _list.default.editList);
    });
    const editCards = document.querySelectorAll(".icon.has-text-primary");
    editCards.forEach(editCard => {
      editCard.addEventListener("dblclick", _card.default.editCard);
    });
    const deleteCards = document.querySelectorAll(".icon.has-text-danger");
    deleteCards.forEach(deleteCard => {
      deleteCard.addEventListener("dblclick", _card.default.deleteCard);
    });
    const deleteLists = document.querySelectorAll(".icon_list.has-text-danger");
    deleteLists.forEach(deleteList => {
      deleteList.addEventListener("dblclick", _list.default.deleteList);
    });
    document.getElementById("addTagButton").addEventListener("click", _tags.default.showAddTagModal);
    const closeTagModal = document.getElementById("addTagModal");
    closeTagModal.querySelectorAll(".close").forEach(modale => {
      modale.addEventListener("click", _tags.default.hideTagModals);
    });
    document.getElementById("updateTagButton").addEventListener("click", _tags.default.showUpdateTagModal);
    const closeUpdateTagModal = document.getElementById("updateTagModal");
    closeUpdateTagModal.querySelectorAll(".close").forEach(modale => {
      modale.addEventListener("click", _tags.default.hideUpdateTagModals);
    });
    document.getElementById("deleteTagButton").addEventListener("click", _tags.default.showDeleteTagModal);
    const closeDeleteTagModal = document.getElementById("deleteTagModal");
    closeDeleteTagModal.querySelectorAll(".close").forEach(modale => {
      modale.addEventListener("click", _tags.default.hideDeleteTagModals);
    });
    const closeAddTagToCardModal = document.getElementById("addTagToCardModal");
    closeAddTagToCardModal.querySelectorAll(".close").forEach(modale => {
      modale.addEventListener("click", _tags.default.hideAddTagToCardModals);
    });
  },

  async getListsFromAPI() {
    try {
      const response = await fetch(`${index.base_url}/lists`);

      if (!response.ok) {
        throw new Error("Impossible de récupérer les listes");
      }

      const listsData = await response.json();
      listsData.forEach(oneList => {
        _list.default.makeListInDOM(oneList.name, oneList.id);

        _card.default.getCardsFromAPI(oneList.id);
      });
      index.dragListsWithSortable();
    } catch (error) {
      console.log(error);
    }
  },

  async dragListsWithSortable() {
    const listsContainer = document.querySelector(".card-lists");
    new Sortable(listsContainer, {
      filter: ".list-btn",
      onEnd: _list.default.updateLists
    });
  }

};
document.addEventListener("DOMContentLoaded", index.init);
var _default = index;
exports.default = _default;

},{"./card.js":1,"./list.js":4,"./tags.js":5}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _card = _interopRequireDefault(require("./card.js"));

var _dragOther = _interopRequireDefault(require("./dragOther.js"));

var _index = _interopRequireDefault(require("./index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const list = {
  showAddListModal() {
    const modale = document.getElementById("addListModal");
    modale.classList.add("is-active");
    modale.querySelector("input[name='name']").value = "";
  },

  hideModals() {
    const closeModale = document.getElementById("addListModal");
    closeModale.classList.remove("is-active");
  },

  makeListInDOM(listName, listId) {
    const lastColumn = document.getElementById("addListButton").closest(".column");
    const template = document.querySelector(".newList");
    const templateContent = template.content;
    const clone = document.importNode(templateContent, true);
    const title = clone.querySelector(".has-text-white");
    title.textContent = listName;
    clone.querySelector(".is-small.has-text-white").addEventListener("click", _card.default.showAddCardModal);
    clone.querySelector(".column").dataset.listId = listId;
    lastColumn.before(clone); //? Create TopDropZone

    const thisList = document.querySelector(`[data-list-id="${listId}"]`);
    const cardsContainer = thisList.querySelector(".panel-block");
    const topDropZone = (0, _dragOther.default)();
    cardsContainer.appendChild(topDropZone);
  },

  async handleAddListForm(e) {
    try {
      e.preventDefault();
      const formData = new FormData(e.target);
      const inputData = formData.get("name");
      const newListPosition = document.querySelectorAll("[data-list-id]").length + 1;
      formData.set("position", newListPosition);
      const response = await fetch(`${_index.default.base_url}/lists`, {
        method: "POST",
        body: formData
      });
      console.log(response);

      if (!response.ok) {
        throw new Error("Problème avec le POST" + response.status);
      }

      const data = await response.json(); // console.log(data);

      list.makeListInDOM(inputData, data.id);
      const deleteLists = document.querySelectorAll(".icon_list.has-text-danger");
      deleteLists.forEach(deleteList => {
        deleteList.addEventListener("dblclick", list.deleteList);
      });
      list.hideModals();
    } catch (error) {
      console.error(error);
    }
  },

  async editList(e) {
    const thisList = e.target.closest(".panel");
    const title = thisList.querySelector("h2");
    title.classList.add("is-hidden");
    const form = thisList.querySelector("form");
    form.classList.remove("is-hidden");
    const setTextToUpdate = thisList.querySelector("input[name='name']");
    setTextToUpdate.setAttribute("value", title.textContent);
    form.addEventListener("submit", list.updateListForm);
  },

  async updateListForm(e) {
    try {
      e.preventDefault();
      const formData = new FormData(e.target);
      const thisList = e.target.closest(".panel");
      const title = thisList.querySelector("h2");
      const form = thisList.querySelector("form");
      const listId = thisList.dataset.listId;
      const response = await fetch(`${_index.default.base_url}/lists/${listId}`, {
        method: "PATCH",
        body: formData
      });
      console.log(response);

      if (!response.ok) {
        title.classList.remove("is-hidden");
        form.classList.add("is-hidden");
        throw new Error("Problème avec le PATCH " + response.status);
      }

      const data = await response.json();
      title.classList.remove("is-hidden");
      form.classList.add("is-hidden");
      title.textContent = formData.get("name");
    } catch (error) {
      console.error(error);
    }
  },

  async deleteList(e) {
    try {
      const confirmation = confirm("Voulez-vous vraiment supprimer cette liste ?");
      if (!confirmation) return;
      const thisList = e.target.closest(".panel");
      const listId = thisList.dataset.listId;
      const parent = thisList.closest(".card-lists");
      const response = await fetch(`${_index.default.base_url}/lists/${listId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Problème " + response.status);
      }

      parent.removeChild(thisList);
      return console.log(`Liste ${listId} supprimée de la bdd`);
    } catch (error) {
      console.error(error);
    }
  },

  async updateLists() {
    const lists = document.querySelectorAll(".column[data-list-id]");
    lists.forEach(async (list, i) => {
      const listId = list.dataset.listId;
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      await fetch(`${_index.default.base_url}/lists/${listId}`, {
        method: "PATCH",
        // je transforme mon body en JSON
        body: JSON.stringify({
          position: i + 1
        }),
        headers
      });
    });
  }

};
var _default = list;
exports.default = _default;

},{"./card.js":1,"./dragOther.js":2,"./index.js":3}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = _interopRequireDefault(require("./index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const tags = {
  showAddTagModal() {
    const modale = document.getElementById("addTagModal");
    modale.classList.add("is-active");
    const tagForm = document.querySelector("#addTagModal form");
    tagForm.addEventListener("submit", tags.handleAddTagForm);
  },

  hideTagModals() {
    const closeModale = document.getElementById("addTagModal");
    closeModale.classList.remove("is-active");
  },

  async showUpdateTagModal() {
    try {
      const modale = document.getElementById("updateTagModal");
      modale.classList.add("is-active");
      const allTagsReponse = await fetch(`${_index.default.base_url}/tags`);
      const allTagsData = await allTagsReponse.json();
      const label = modale.querySelector(".selectTag");
      const options = label.querySelectorAll("option").length;

      if (options === 1) {
        allTagsData.forEach(tag => {
          label.insertAdjacentHTML("beforeend", `<option value="${tag.id}">${tag.name}</option>`);
        });
      }

      const updateTagForm = document.querySelector("#updateTagModal form");
      updateTagForm.addEventListener("submit", tags.handleUpdateTagForm);
    } catch (error) {
      console.error(error);
    }
  },

  hideUpdateTagModals() {
    const closeModale = document.getElementById("updateTagModal");
    closeModale.classList.remove("is-active");
  },

  async showDeleteTagModal() {
    try {
      const modale = document.getElementById("deleteTagModal");
      modale.classList.add("is-active");
      const allTagsReponse = await fetch(`${_index.default.base_url}/tags`);
      const allTagsData = await allTagsReponse.json();
      const label = modale.querySelector(".selectTag");
      const options = label.querySelectorAll("option").length;

      if (options === 1) {
        allTagsData.forEach(tag => {
          label.insertAdjacentHTML("beforeend", `<option value="${tag.id}">${tag.name}</option>`);
        });
      }

      const deleteTagForm = document.querySelector("#deleteTagModal form");
      deleteTagForm.addEventListener("submit", tags.handleDeleteTagForm);
    } catch (error) {
      console.error(error);
    }
  },

  hideDeleteTagModals() {
    const closeModale = document.getElementById("deleteTagModal");
    closeModale.classList.remove("is-active");
  },

  async handleAddTagForm(e) {
    try {
      e.preventDefault();
      const formData = new FormData(e.target);
      const response = await fetch(`${_index.default.base_url}/tags`, {
        method: "POST",
        body: formData
      });
      console.log(response);

      if (!response.ok) {
        throw new Error("Problème avec le POST" + response.status);
      }

      const data = await response.json(); // console.log(data);

      tags.hideTagModals();
    } catch (error) {
      console.error(error);
    }
  },

  async handleUpdateTagForm(e) {
    try {
      e.preventDefault();
      const formData = new FormData(e.target);
      const response = await fetch(`${_index.default.base_url}/tags/${formData.get("tagId")}`, {
        method: "PATCH",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Problème avec le PATCH " + response.status);
      }

      const data = await response.json();
      const tagsToUpdate = document.querySelectorAll(`[data-tag-id="${formData.get("tagId")}"]`);
      tagsToUpdate.forEach(tag => tag.textContent = formData.get("name"));
      tags.hideUpdateTagModals();
    } catch (error) {
      console.error(error);
    }
  },

  async handleDeleteTagForm(e) {
    try {
      e.preventDefault();
      const formData = new FormData(e.target);
      const response = await fetch(`${_index.default.base_url}/tags/${formData.get("tagId")}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Problème avec le delete " + response.status);
      }

      const tagsToDelete = document.querySelectorAll(`[data-tag-id="${formData.get("tagId")}"]`);
      tagsToDelete.forEach(tag => tag.remove());
      tags.hideDeleteTagModals();
    } catch (error) {
      console.error(error);
    }
  },

  async showAddTagToCardModal(e) {
    try {
      const modale = document.getElementById("addTagToCardModal");
      modale.classList.add("is-active");
      const allTagsReponse = await fetch(`${_index.default.base_url}/tags`);
      const allTagsData = await allTagsReponse.json();
      const label = modale.querySelector(".selectTag");
      const options = label.querySelectorAll("option").length;

      if (options === 1) {
        //option par default: "sélectionnez un label dans cette liste: "
        allTagsData.forEach(tag => {
          label.insertAdjacentHTML("beforeend", `<option value="${tag.id}">${tag.name}</option>`);
        });
      }

      const cardId = e.target.closest(".box").dataset.cardId;
      modale.querySelector("input[name='cardId']").setAttribute("value", cardId);
      const tagForm = document.querySelector("#addTagToCardModal form");
      tagForm.addEventListener("submit", tags.handleAddTagToCardForm);
    } catch (error) {
      console.error(error);
    }
  },

  hideAddTagToCardModals() {
    const closeModale = document.getElementById("addTagToCardModal");
    closeModale.classList.remove("is-active");
  },

  async handleAddTagToCardForm(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const addTagToCard = await fetch(`${_index.default.base_url}/cards/${formData.get("cardId")}/tags/${formData.get("tagId")}`, {
      method: "PUT"
    }); // const data = await addTagToCard.json();

    const thisTag = await fetch(`${_index.default.base_url}/tags/${formData.get("tagId")}`);
    const thisTagData = await thisTag.json();
    const thisCard = document.querySelector(`[data-card-id="${formData.get("cardId")}"]`).querySelector(".tags");
    const tagTemplate = document.querySelector(".newTag");
    const tagClone = document.importNode(tagTemplate.content, true);
    const thisTagClone = tagClone.querySelector(".tag");
    thisTagClone.style.backgroundColor = thisTagData.color;
    thisTagClone.dataset.tagId = thisTagData.id;
    thisTagClone.querySelector(".tagTitle").innerText = thisTagData.name;
    thisCard.appendChild(thisTagClone);
    tags.hideAddTagToCardModals();
    console.log(thisCard.querySelector(".addTag"));
    thisCard.querySelector(".addTag").addEventListener("dblclick", tags.showAddTagToCardModal);
    thisCard.querySelector(".delete.is-small").addEventListener("dblclick", tags.removeTagFromCard);
  },

  async removeTagFromCard(e) {
    const confirmDelete = confirm("Voulez-vous vraiment enlever ce label ?");
    if (!confirmDelete) return;
    const thisCard = e.target.closest(".box");
    const thisCardId = thisCard.dataset.cardId;
    const thisTag = e.target.closest(".tag");
    const thisTagId = thisTag.dataset.tagId;
    const removeTagFromCard = await fetch(`${_index.default.base_url}/cards/${thisCardId}/tags/${thisTagId}`, {
      method: "DELETE"
    });
    thisCard.querySelector(`[data-tag-id="${thisTagId}"]`).remove();
  }

};
var _default = tags;
exports.default = _default;

},{"./index.js":3}]},{},[3]);
