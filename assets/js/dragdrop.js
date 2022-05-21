const initDrag = () => {
	document.addEventListener("mousedown", handleDrag);
};

const handleDrag = (e) => {
	const thisList = e.target.closest(".section");

	const cards = thisList.querySelectorAll(".box");
	const dropZones = thisList.querySelectorAll(".dropZone");
	cards.forEach((card) => {
		card.addEventListener("dragstart", () => {
			card.classList.add("dragging");
			// dropZones.forEach(
			// 	(dropZone) => (dropZone.style.margin = "2rem 0 2rem 0")
			// );
		});
		card.addEventListener("dragend", () => {
			card.classList.remove("dragging");
			// dropZones.forEach((dropZone) => dropZone.style.removeProperty("margin"));
		});
	});

	dropZones.forEach((dropZone) => {
		dropZone.addEventListener("dragover", (e) => {
			e.preventDefault();
			// dropZone.classList.add("is-active");

			const afterElement = getDragAfterElement(dropZone, e.clientY);
			console.log(afterElement);
			const card = document.querySelector(".dragging");
			if (afterElement == null) {
				dropZone.appendChild(card);
			} else {
				dropZone.insertBefore(card, afterElement);
			}
		});
		// dropZone.addEventListener("dragleave", (e) => {
		// 	dropZone.classList.remove("is-active");
		// });
	});

	const getDragAfterElement = (dropZone, y) => {
		const draggableCards = [
			...dropZone.querySelectorAll(".box:not(.dragging)"),
		];

		return draggableCards.reduce(
			(closest, child) => {
				const box = child.getBoundingClientRect();
				const offset = y - box.top - box.height / 2;
				if (offset < 0 && offset > closest.offset) {
					return { offset: offset, element: child };
				} else {
					return closest;
				}
			},
			{ offset: Number.NEGATIVE_INFINITY }
		).element;
	};
};

export default initDrag;
