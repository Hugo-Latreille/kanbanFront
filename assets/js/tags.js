import index from "./index.js";

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

			const allTagsReponse = await fetch(`${index.base_url}/tags`);
			const allTagsData = await allTagsReponse.json();

			const label = modale.querySelector(".selectTag");
			const options = label.querySelectorAll("option").length;

			if (options === 1) {
				allTagsData.forEach((tag) => {
					label.insertAdjacentHTML(
						"beforeend",
						`<option value="${tag.id}">${tag.name}</option>`
					);
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

			const allTagsReponse = await fetch(`${index.base_url}/tags`);
			const allTagsData = await allTagsReponse.json();

			const label = modale.querySelector(".selectTag");
			const options = label.querySelectorAll("option").length;

			if (options === 1) {
				allTagsData.forEach((tag) => {
					label.insertAdjacentHTML(
						"beforeend",
						`<option value="${tag.id}">${tag.name}</option>`
					);
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
			const response = await fetch(`${index.base_url}/tags`, {
				method: "POST",
				body: formData,
			});

			console.log(response);
			if (!response.ok) {
				throw new Error("Problème avec le POST" + response.status);
			}

			const data = await response.json();
			// console.log(data);

			tags.hideTagModals();
		} catch (error) {
			console.error(error);
		}
	},
	async handleUpdateTagForm(e) {
		try {
			e.preventDefault();
			const formData = new FormData(e.target);

			const response = await fetch(
				`${index.base_url}/tags/${formData.get("tagId")}`,
				{
					method: "PATCH",
					body: formData,
				}
			);

			if (!response.ok) {
				throw new Error("Problème avec le PATCH " + response.status);
			}

			const data = await response.json();

			const tagsToUpdate = document.querySelectorAll(
				`[data-tag-id="${formData.get("tagId")}"]`
			);
			tagsToUpdate.forEach((tag) => (tag.textContent = formData.get("name")));

			tags.hideUpdateTagModals();
		} catch (error) {
			console.error(error);
		}
	},
	async handleDeleteTagForm(e) {
		try {
			e.preventDefault();
			const formData = new FormData(e.target);

			const response = await fetch(
				`${index.base_url}/tags/${formData.get("tagId")}`,
				{
					method: "DELETE",
				}
			);
			if (!response.ok) {
				throw new Error("Problème avec le delete " + response.status);
			}
			const tagsToDelete = document.querySelectorAll(
				`[data-tag-id="${formData.get("tagId")}"]`
			);
			tagsToDelete.forEach((tag) => tag.remove());

			tags.hideDeleteTagModals();
		} catch (error) {
			console.error(error);
		}
	},

	async showAddTagToCardModal(e) {
		try {
			const modale = document.getElementById("addTagToCardModal");
			modale.classList.add("is-active");

			const allTagsReponse = await fetch(`${index.base_url}/tags`);
			const allTagsData = await allTagsReponse.json();

			const label = modale.querySelector(".selectTag");
			const options = label.querySelectorAll("option").length;

			if (options === 1) {
				//option par default: "sélectionnez un label dans cette liste: "
				allTagsData.forEach((tag) => {
					label.insertAdjacentHTML(
						"beforeend",
						`<option value="${tag.id}">${tag.name}</option>`
					);
				});
			}
			const cardId = e.target.closest(".box").dataset.cardId;
			modale
				.querySelector("input[name='cardId']")
				.setAttribute("value", cardId);

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
		console.log(formData.get("cardId"), formData.get("tagId"));

		const addTagToCard = await fetch(
			`${index.base_url}/cards/${formData.get("cardId")}/tags/${formData.get(
				"tagId"
			)}`,
			{
				method: "PUT",
			}
		);
		// const data = await addTagToCard.json();

		const thisTag = await fetch(
			`${index.base_url}/tags/${formData.get("tagId")}`
		);
		const thisTagData = await thisTag.json();

		const thisCard = document
			.querySelector(`[data-card-id="${formData.get("cardId")}"]`)
			.querySelector(".tags");

		const tagTemplate = document.querySelector(".newTag");
		const tagClone = document.importNode(tagTemplate.content, true);
		const thisTagClone = tagClone.querySelector(".tag");
		thisTagClone.style.backgroundColor = thisTagData.color;
		thisTagClone.dataset.tagId = thisTagData.id;
		thisTagClone.innerText = thisTagData.name;
		thisCard.appendChild(thisTagClone);

		thisCard
			.querySelector(".addTag")
			.addEventListener("dblclick", tags.showAddTagToCardModal);
		thisCard
			.querySelector(".delete.is-small")
			.addEventListener("dblclick", tags.removeTagFromCard);

		console.log(thisTag);
		tags.hideAddTagToCardModals();
	},
	async removeTagFromCard(e) {
		const confirmDelete = confirm("Voulez-vous vraiment enlever ce label ?");
		if (!confirmDelete) return;
		const thisCard = e.target.closest(".box");
		const thisCardId = thisCard.dataset.cardId;
		const thisTag = e.target.closest(".tag");
		const thisTagId = thisTag.dataset.tagId;

		const removeTagFromCard = await fetch(
			`${index.base_url}/cards/${thisCardId}/tags/${thisTagId}`,
			{
				method: "DELETE",
			}
		);

		thisCard.querySelector(`[data-tag-id="${thisTagId}"]`).remove();
	},
};

export default tags;
