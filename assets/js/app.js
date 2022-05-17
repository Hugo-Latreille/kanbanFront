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
		document.querySelectorAll(".close").forEach((modale) => {
			modale.addEventListener("click", app.hideModals);
		});
		const form = document.querySelector(".modal-card > form");
		form.addEventListener("submit", app.handleAddListForm);
	},
	hideModals() {
		const closeModale = document.getElementById("addListModal");
		closeModale.classList.remove("is-active");
	},
	showAddListModal() {
		const modale = document.getElementById("addListModal");
		modale.classList.add("is-active");
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

		firstList.before(clone);
	},
};

// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener("DOMContentLoaded", app.init);
