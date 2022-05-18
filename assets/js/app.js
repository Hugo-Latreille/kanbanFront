var app = {
	init: function () {
		console.log("app.init !");
		app.addListenerToActions();
		app.getListsFromAPI();
	},

	base_url: "http://localhost:5002/api",

	addListenerToActions() {
		const button = document.getElementById("addListButton");
		button.addEventListener("click", app.showAddListModal);

		const listModale = document.getElementById("addListModal");
		listModale.querySelectorAll(".close").forEach((modale) => {
			modale.addEventListener("click", app.hideModals);
		});
		const listForm = document.querySelector("#addListModal form");
		listForm.addEventListener("submit", app.handleAddListForm);

		document.querySelectorAll(".is-small.has-text-white").forEach((icon) => {
			icon.addEventListener("click", app.showAddCardModal);
		});

		const cardModale = document.getElementById("addCardModal");
		cardModale.querySelectorAll(".close").forEach((modale) => {
			modale.addEventListener("click", app.hideCardModals);
		});

		const editLists = document.querySelectorAll("h2");
		editLists.forEach((editList) => {
			editList.addEventListener("dblclick", app.editList);
		});

		const editCards = document.querySelectorAll(".icon.has-text-primary");
		editCards.forEach((editCard) => {
			editCard.addEventListener("dblclick", app.editCard);
		});

		const deleteCards = document.querySelectorAll(".icon.has-text-danger");
		deleteCards.forEach((deleteCard) => {
			deleteCard.addEventListener("dblclick", app.deleteCard);
		});

		const deleteLists = document.querySelectorAll(".icon_list.has-text-danger");
		deleteLists.forEach((deleteList) => {
			deleteList.addEventListener("dblclick", app.deleteList);
		});
	},
	showAddCardModal(e) {
		let listId = e.target.closest(".panel");
		listId = listId.getAttribute("data-list-id");
		const modale = document.getElementById("addCardModal");
		const inputListId = modale.querySelector('[name="list-id"]');
		inputListId.setAttribute("value", `${listId}`);
		modale.classList.add("is-active");
		const cardForm = document.querySelector("#addCardModal form");
		cardForm.addEventListener("submit", app.handleAddCardForm);
	},
	hideCardModals() {
		const closeModale = document.getElementById("addCardModal");
		closeModale.classList.remove("is-active");
	},
	hideModals() {
		const closeModale = document.getElementById("addListModal");
		closeModale.classList.remove("is-active");
	},
	showAddListModal() {
		const modale = document.getElementById("addListModal");
		modale.classList.add("is-active");
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

			const response = await fetch(`${app.base_url}/cards`, {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Problème avec le POST" + response.status);
			}
			const data = await response.json();
			console.log(newName);

			app.makeCardInDOM(newName, listId, colorData, data.id);
			app.hideCardModals();
		} catch (error) {
			console.error(error);
		}
	},
	makeCardInDOM(newName, listId, colorData, dataId) {
		const list = document.querySelector(`[data-list-id="${listId}"]`);
		const firstList = list.querySelector(".panel-block");
		const template = document.querySelector(".newCard");
		const templateContent = template.content;
		const clone = document.importNode(templateContent, true);
		const title = clone.querySelector(".column");
		title.textContent = newName;
		const setListIdInCard = clone.querySelector("input[name='list-id']");
		setListIdInCard.setAttribute("value", listId);
		clone.querySelector(".box").dataset.cardId = dataId;
		clone.querySelector(".box").style.borderColor = colorData;

		firstList.appendChild(clone);
		app.addListenerToActions();
	},
	async handleAddListForm(e) {
		try {
			e.preventDefault();

			const formData = new FormData(e.target);
			const inputData = formData.get("name");
			const newListPosition =
				document.querySelectorAll("[data-list-id]").length + 1;

			formData.set("position", newListPosition);

			const response = await fetch(`${app.base_url}/lists`, {
				method: "POST",
				body: formData,
			});

			console.log(response);
			if (!response.ok) {
				throw new Error("Problème avec le POST" + response.status);
			}

			const data = await response.json();
			app.makeListInDOM(inputData, data.id);
			app.hideModals();
		} catch (error) {
			console.error(error);
		}
	},
	makeListInDOM(inputData, listId) {
		const lastColumn = document
			.getElementById("addListButton")
			.closest(".column");
		const template = document.querySelector(".newList");
		const templateContent = template.content;
		const clone = document.importNode(templateContent, true);
		const title = clone.querySelector(".has-text-white");
		title.textContent = inputData;
		clone
			.querySelector(".is-small.has-text-white")
			.addEventListener("click", app.showAddCardModal);

		clone.querySelector(".column").dataset.listId = listId;
		lastColumn.before(clone);
	},
	async getListsFromAPI() {
		try {
			const response = await fetch(`${app.base_url}/lists`);

			if (!response.ok) {
				throw new Error("Impossible de récupérer les listes");
			}
			const listsData = await response.json();
			listsData.forEach((list) => {
				const lastColumn = document
					.getElementById("addListButton")
					.closest(".column");
				const template = document.querySelector(".newList");
				const templateContent = template.content;
				const clone = document.importNode(templateContent, true);
				const title = clone.querySelector(".has-text-white");
				title.textContent = list.name;
				clone.querySelector(".column").dataset.listId = list.id;

				lastColumn.before(clone);
				app.getCardsFromAPI(list.id);
			});
		} catch (error) {
			console.log(error);
		}
	},
	async getCardsFromAPI(listId) {
		try {
			const response = await fetch(`${app.base_url}/cards`);
			if (!response.ok) {
				throw new Error("Impossible de récupérer les cartes");
			}
			const cardsData = await response.json();
			const cardsInList = cardsData.filter((card) => card.list_id === listId);
			cardsInList.forEach((card) => {
				const list = document.querySelector(`[data-list-id="${listId}"]`);
				const firstList = list.querySelector(".panel-block");
				const template = document.querySelector(".newCard");
				const clone = document.importNode(template.content, true);
				const title = clone.querySelector(".column");
				title.textContent = card.content;
				const setListIdInCard = clone.querySelector("input[name='list-id']");
				setListIdInCard.setAttribute("value", listId);
				clone.querySelector(".box").dataset.cardId = card.id;
				clone.querySelector(".box").style.borderColor = card.color;

				firstList.appendChild(clone);
				app.addListenerToActions();
			});
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
		form.addEventListener("submit", app.updateListForm);
	},
	async updateListForm(e) {
		try {
			e.preventDefault();
			const formData = new FormData(e.target);
			const thisList = e.target.closest(".panel");
			const title = thisList.querySelector("h2");
			const form = thisList.querySelector("form");
			const listId = thisList.dataset.listId;

			const response = await fetch(`${app.base_url}/lists/${listId}`, {
				method: "PATCH",
				// headers: {
				// 	Accept: "application/json",
				// 	"Content-Type": "application/json",
				// },
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
			title.textContent = formData.get("name");
		} catch (error) {
			console.error(error);
		}
	},
	editCard(e) {
		const thisCard = e.target.closest(".box");
		const title = thisCard.querySelector(".column");
		title.classList.add("is-hidden");
		const form = thisCard.querySelector("form");
		form.classList.remove("is-hidden");
		thisCard
			.querySelector(".input.is-small")
			.setAttribute("placeholder", title.textContent);
		form.addEventListener("submit", app.updateCardForm);
	},
	async updateCardForm(e) {
		try {
			e.preventDefault();
			const formData = new FormData(e.target);
			const thisCard = e.target.closest(".box");
			const title = thisCard.querySelector(".column");
			const form = thisCard.querySelector("form");
			const cardId = thisCard.dataset.cardId;

			const response = await fetch(`${app.base_url}/cards/${cardId}`, {
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
				`${app.base_url}/cards/${cardId}`
			);
			const findNewColorData = await findNewColorResponse.json();

			thisCard.style.borderColor = findNewColorData.color;
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
			cardId = thisCard.dataset.cardId;
			//* soit en récup listid et on getCardsFromAPI
			// const thisListId = thisCard.querySelector("input[name='list-id']").value;
			//* soit on supprime directement la card en js
			const parent = thisCard.closest(".panel-block");

			const response = await fetch(`${app.base_url}/cards/${cardId}`, {
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
	async deleteList(e) {
		try {
			const confirmation = confirm(
				"Voulez-vous vraiment supprimer cette liste ?"
			);
			if (!confirmation) return;

			const thisList = e.target.closest(".panel");
			const listId = thisList.dataset.listId;

			const parent = thisList.closest(".card-lists");

			const response = await fetch(`${app.base_url}/lists/${listId}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
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
};

// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener("DOMContentLoaded", app.init);
