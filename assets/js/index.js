import list from "./list.js";
import card from "./card.js";
import tags from "./tags.js";

const index = {
	init: function () {
		console.log("app.init !");
		index.addListenerToActions();
		index.getListsFromAPI();
	},

	base_url: "http://localhost:5002/api",

	addListenerToActions() {
		const button = document.getElementById("addListButton");
		button.addEventListener("click", list.showAddListModal);

		const listModale = document.getElementById("addListModal");
		listModale.querySelectorAll(".close").forEach((modale) => {
			modale.addEventListener("click", list.hideModals);
		});
		const listForm = document.querySelector("#addListModal form");
		listForm.addEventListener("submit", list.handleAddListForm);

		document.querySelectorAll(".is-small.has-text-white").forEach((icon) => {
			icon.addEventListener("click", card.showAddCardModal);
		});

		const cardModale = document.getElementById("addCardModal");
		cardModale.querySelectorAll(".close").forEach((modale) => {
			modale.addEventListener("click", card.hideCardModals);
		});

		const editLists = document.querySelectorAll("h2");
		editLists.forEach((editList) => {
			editList.addEventListener("dblclick", list.editList);
		});

		const editCards = document.querySelectorAll(".icon.has-text-primary");
		editCards.forEach((editCard) => {
			editCard.addEventListener("dblclick", card.editCard);
		});

		const deleteCards = document.querySelectorAll(".icon.has-text-danger");
		deleteCards.forEach((deleteCard) => {
			deleteCard.addEventListener("dblclick", card.deleteCard);
		});

		const deleteLists = document.querySelectorAll(".icon_list.has-text-danger");
		deleteLists.forEach((deleteList) => {
			deleteList.addEventListener("dblclick", list.deleteList);
		});

		document
			.getElementById("addTagButton")
			.addEventListener("click", tags.showAddTagModal);

		const closeTagModal = document.getElementById("addTagModal");
		closeTagModal.querySelectorAll(".close").forEach((modale) => {
			modale.addEventListener("click", tags.hideTagModals);
		});

		document
			.getElementById("updateTagButton")
			.addEventListener("click", tags.showUpdateTagModal);

		const closeUpdateTagModal = document.getElementById("updateTagModal");
		closeUpdateTagModal.querySelectorAll(".close").forEach((modale) => {
			modale.addEventListener("click", tags.hideUpdateTagModals);
		});

		document
			.getElementById("deleteTagButton")
			.addEventListener("click", tags.showDeleteTagModal);

		const closeDeleteTagModal = document.getElementById("deleteTagModal");
		closeDeleteTagModal.querySelectorAll(".close").forEach((modale) => {
			modale.addEventListener("click", tags.hideDeleteTagModals);
		});
	},
	async getListsFromAPI() {
		try {
			const response = await fetch(`${index.base_url}/lists`);

			if (!response.ok) {
				throw new Error("Impossible de récupérer les listes");
			}
			const listsData = await response.json();
			listsData.forEach((oneList) => {
				list.makeListInDOM(oneList.name, oneList.id);

				card.getCardsFromAPI(oneList.id);
			});
		} catch (error) {
			console.log(error);
		}
	},
};

document.addEventListener("DOMContentLoaded", index.init);

export default index;
