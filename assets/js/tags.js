import index from "./index.js";

const tags = {
	showAddTagModal(e) {
		const modale = document.getElementById("addTagModal");
		modale.classList.add("is-active");
		const cardForm = document.querySelector("#addTagModal form");
		cardForm.addEventListener("submit", tags.handleAddTagForm);
	},
	hideTagModals() {
		const closeModale = document.getElementById("addTagModal");
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
};

export default tags;
