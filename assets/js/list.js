import card from "./card.js";
import index from "./index.js";

const list = {
	showAddListModal() {
		const modale = document.getElementById("addListModal");
		modale.classList.add("is-active");
	},
	hideModals() {
		const closeModale = document.getElementById("addListModal");
		closeModale.classList.remove("is-active");
	},
	makeListInDOM(listName, listId) {
		const lastColumn = document
			.getElementById("addListButton")
			.closest(".column");
		const template = document.querySelector(".newList");
		const templateContent = template.content;
		const clone = document.importNode(templateContent, true);
		const title = clone.querySelector(".has-text-white");
		title.textContent = listName;
		clone
			.querySelector(".is-small.has-text-white")
			.addEventListener("click", card.showAddCardModal);

		clone.querySelector(".column").dataset.listId = listId;
		lastColumn.before(clone);
	},
	async handleAddListForm(e) {
		try {
			e.preventDefault();

			const formData = new FormData(e.target);
			const inputData = formData.get("name");
			const newListPosition =
				document.querySelectorAll("[data-list-id]").length + 1;

			formData.set("position", newListPosition);

			const response = await fetch(`${index.base_url}/lists`, {
				method: "POST",
				body: formData,
			});

			console.log(response);
			if (!response.ok) {
				throw new Error("Problème avec le POST" + response.status);
			}

			const data = await response.json();
			// console.log(data);
			list.makeListInDOM(inputData, data.id);
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

			const response = await fetch(`${index.base_url}/lists/${listId}`, {
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
	async deleteList(e) {
		try {
			const confirmation = confirm(
				"Voulez-vous vraiment supprimer cette liste ?"
			);
			if (!confirmation) return;

			const thisList = e.target.closest(".panel");
			const listId = thisList.dataset.listId;

			const parent = thisList.closest(".card-lists");

			const response = await fetch(`${index.base_url}/lists/${listId}`, {
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

export default list;
