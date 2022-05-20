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
			dropZones.forEach(
				(dropZone) => (dropZone.style.margin = "2rem 0 2rem 0")
			);
		});
		card.addEventListener("dragend", () => {
			card.classList.remove("dragging");
			// dropZones.forEach((dropZone) => dropZone.style.removeProperty("margin"));
		});
	});

	dropZones.forEach((dropZone) => {
		dropZone.addEventListener("dragover", (e) => {
			e.preventDefault();
			const card = document.querySelector(".dragging");
			dropZone.appendChild(card);
		});
	});
};

export default initDrag;
