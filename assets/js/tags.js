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
			allTagsData.forEach((tag) => {
				label.insertAdjacentHTML(
					"beforeend",
					`<option value="${tag.id}">${tag.name}</option>`
				);
			});
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
			console.log(data);
			const tagsToUpdate = document.querySelectorAll(
				`[data-tag-id="${formData.get("tagId")}"]`
			);
			const tagTitle = tagsToUpdate.forEach(
				(tag) => (tag.textContent = formData.get("name"))
			);

			tags.hideUpdateTagModals();
		} catch (error) {
			console.error(error);
		}
	},
};

export default tags;
