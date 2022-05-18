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
		const inputListId = formData.get("list-id");
		app.makeCardInDOM(inputData, inputListId);
		app.hideCardModals();
	},
	makeCardInDOM(inputData, inputListId) {
		const list = document.querySelector(`[data-list-id="${inputListId}"]`);
		const firstList = list.querySelector(".panel-block");
		const template = document.querySelector(".newCard");
		const templateContent = template.content;
		const clone = document.importNode(templateContent, true);
		const title = clone.querySelector(".column");
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
				// headers: {
				// 	"Content-Type": "application/json",
				// },
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
				clone.querySelector(".box").style.backgroundColor = card.color;

				firstList.appendChild(clone);
				app.addListenerToActions();
			});
		} catch (error) {
			console.error(error);
		}
	},
};

// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener("DOMContentLoaded", app.init);
