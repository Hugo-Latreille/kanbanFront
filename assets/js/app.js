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
	handleAddCardForm(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		const inputData = formData.get("name");
		const colorData = formData.get("color");
		console.log(colorData);
		const inputListId = formData.get("list-id");
		app.makeCardInDOM(inputData, inputListId, colorData);
		app.hideCardModals();
	},
	makeCardInDOM(inputData, inputListId, colorData) {
		const list = document.querySelector(`[data-list-id="${inputListId}"]`);
		const firstList = list.querySelector(".panel-block");
		const template = document.querySelector(".newCard");
		const templateContent = template.content;
		const clone = document.importNode(templateContent, true);
		const title = clone.querySelector(".column");
		clone.querySelector(".box").style.borderColor = colorData;
		console.log(colorData);
		title.textContent = inputData;

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
			console.log(data);
			app.makeListInDOM(inputData);
			app.hideModals();
		} catch (error) {
			console.error(error);
		}
	},
	makeListInDOM(inputData) {
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

		const timestamp = new Date().getTime();
		clone.querySelector(".column").dataset.listId = timestamp;
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
};

// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener("DOMContentLoaded", app.init);
