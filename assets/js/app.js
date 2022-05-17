// on objet qui contient des fonctions
var app = {
	// fonction d'initialisation, lancée au chargement de la page
	init: function () {
		console.log("app.init !");
		app.addListenerToActions();
	},

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
	handleAddListForm(e) {
		e.preventDefault();
		// console.log(e.target[1].value);
		const formData = new FormData(e.target);
		const inputData = formData.get("name");
		app.makeListInDOM(inputData);
		app.hideModals();

		// for (const value of formData.values()) {
		// 	console.log(value);
	},
	makeListInDOM(inputData) {
		const firstList = document.querySelector("[data-list-id='A']");
		const template = document.querySelector(".newList");
		const templateContent = template.content;
		const clone = document.importNode(templateContent, true);
		const title = clone.querySelector(".has-text-white");
		title.textContent = inputData;
		clone
			.querySelector(".is-small.has-text-white")
			.addEventListener("click", app.showAddCardModal);
		firstList.before(clone);
	},
};

// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener("DOMContentLoaded", app.init);
