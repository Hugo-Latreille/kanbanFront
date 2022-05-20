import initDrag from "./dragdrop.js";
import index from "./index.js";
import tags from "./tags.js";

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

			const response = await fetch(`${index.base_url}/cards`, {
				method: "POST",
				body: formData,
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
			const response = await fetch(`${index.base_url}/cards`);
			if (!response.ok) {
				throw new Error("Impossible de récupérer les cartes");
			}
			const cardsData = await response.json();
			const cardsInList = cardsData.filter((card) => card.list_id === listId);
			cardsInList.forEach((oneCard) => {
				card.makeCardInDOM(
					oneCard.content,
					oneCard.list_id,
					oneCard.color,
					oneCard.id,
					oneCard.position,
					oneCard.tags
				);
				index.addListenerToActions();
			});
		} catch (error) {
			console.error(error);
		}
	},
	makeCardInDOM(
		newName,
		listId,
		colorData,
		dataId,
		newCardPosition,
		tagsFromCard
	) {
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
			tagsFromCard.forEach((tag) => {
				const tagTemplate = document.querySelector(".newTag");
				const tagClone = document.importNode(tagTemplate.content, true);
				const thisTag = tagClone.querySelector(".tag");
				thisTag.style.backgroundColor = tag.color;
				thisTag.dataset.tagId = tag.id;
				thisTag.querySelector(".tagTitle").innerText = tag.name;
				tagsDiv.appendChild(tagClone);
			});
		}

		list.querySelectorAll(".addTag").forEach((tag) => {
			tag.addEventListener("dblclick", tags.showAddTagToCardModal);
		});

		list.querySelectorAll(".delete.is-small").forEach((deleteBtn) => {
			deleteBtn.addEventListener("dblclick", tags.removeTagFromCard);
		});
		firstList.appendChild(clone);
		index.addListenerToActions();

		initDrag();
	},
	editCard(e) {
		const thisCard = e.target.closest(".box");
		const title = thisCard.querySelector(".column");
		title.classList.add("is-hidden");
		const form = thisCard.querySelector("form");
		form.classList.remove("is-hidden");
		thisCard
			.querySelector(".input.is-small")
			.setAttribute("value", title.textContent);

		//*update position
		const thisCardPosition = thisCard.querySelector(
			"input[name='position']"
		).value;
		const maxPosition = thisCard
			.closest(".panel")
			.querySelectorAll(".box").length;
		const selectPosition = thisCard.querySelector(".selectPosition");

		const setSelected = (option) => {
			return option + 1 === Number(thisCardPosition) ? "selected" : "";
		};
		for (let option = 0; option < maxPosition; option++) {
			selectPosition.innerHTML += `<option value="${option + 1}" ${setSelected(
				option
			)}>${option + 1}</option>`;
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
			const thisCardPosition = thisCard.querySelector(
				"input[name='position']"
			).value;
			const newPosition = formData.get("newPosition");
			const listId = thisCard.querySelector("input[name='list-id']").value;
			console.log(listId);
			formData.set("list_id", listId);

			// if (!thisCardPosition === newPosition)
			//*Update Position only
			const updatePosition = await fetch(
				`${index.base_url}/cards/${cardId}/position/${newPosition}`,
				{
					method: "PATCH",
				}
			);
			const updatePositionData = await updatePosition.json();
			console.log(updatePositionData);

			formData.delete("newPosition");
			formData.delete("position");

			const response = await fetch(`${index.base_url}/cards/${cardId}`, {
				method: "PATCH",
				body: formData,
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

			const findNewColorResponse = await fetch(
				`${index.base_url}/cards/${cardId}`
			);
			const findNewColorData = await findNewColorResponse.json();

			thisCard.style.borderColor = findNewColorData.color;
			document.location.reload();
		} catch (error) {
			console.error(error);
		}
	},
	async deleteCard(e) {
		try {
			const confirmation = confirm(
				"Voulez-vous vraiment supprimer cette carte ?"
			);
			if (!confirmation) return;

			const thisCard = e.target.closest(".box");
			const cardId = thisCard.dataset.cardId;
			//* soit en récup listId et on getCardsFromAPI
			// const thisListId = thisCard.querySelector("input[name='list-id']").value;
			//* soit on supprime directement la card en js
			const parent = thisCard.closest(".panel-block");

			const response = await fetch(`${index.base_url}/cards/${cardId}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Problème " + response.status);
			}
			parent.removeChild(thisCard);
			return console.log(`Carte ${cardId} supprimée de la bdd`);
		} catch (error) {
			console.error(error);
		}
	},
};

export default card;

//* update de toutes les positions : back ok
//* SINON
//* nouvelle < ancienne : on incrémente de 1 la position de toutes les autres cartes de la même liste dont la position est >= nouvelle ET < à l'ancienne
//* nouvelle > ancienne : on décrémente de 1 la position de toutes les autres cartes de la même liste dont la position est > ancienne et <= nouvelle
//* On update la position de cette carte

//? nouvelle < ancienne -> position >= nouvelle && < ancienne -> position +1 -> update position chacune de ces cartes puis la carte
//? nouvelle > ancienne -> position > ancienne && <= nouvelle -> position -1 -> update ces cartes puis la carte
