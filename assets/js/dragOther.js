const createDropZone = () => {
	const range = document.createRange();
	range.selectNode(document.body);

	const dropZone = range.createContextualFragment(
		`<div class="dropZone"></div>`
	).children[0];

	dropZone.addEventListener("dragover", (e) => {
		e.preventDefault();
		dropZone.classList.add("is-active");
	});

	dropZone.addEventListener("dragleave", () => {
		dropZone.classList.remove("is-active");
	});
	dropZone.addEventListener("drop", (e) => {
		e.preventDefault();
		dropZone.classList.remove("is-active");
		const thisList = dropZone.closest("[data-list-id]");
		const thisListId = Number(thisList.dataset.listId);
		const dropZonesInList = [...thisList.querySelectorAll(".dropZone")];
		const droppedIndex = dropZonesInList.indexOf(dropZone) + 1;
		const cardId = e.dataTransfer.getData("text/plain");
		const droppedCardElement = document.querySelector(
			`[data-card-id="${cardId}"]`
		).parentElement;

		const insertAfter = dropZone.parentElement.classList.contains(
			"cardWithDropZone"
		)
			? dropZone.parentElement
			: dropZone;

		if (droppedIndex === 0) {
			return (droppedIndex = 1);
		}

		insertAfter.after(droppedCardElement);
	});

	return dropZone;
};

export default createDropZone;
