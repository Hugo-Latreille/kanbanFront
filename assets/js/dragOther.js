import index from "./index.js";

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
		const newListId = Number(thisList.dataset.listId);
		const dropZonesInList = [...thisList.querySelectorAll(".dropZone")];
		let newCardPosition = dropZonesInList.indexOf(dropZone);
		const cardId = Number(e.dataTransfer.getData("text/plain"));

		const droppedCardElement = document.querySelector(
			`[data-card-id="${cardId}"]`
		).parentElement;
		const thisCardPosition = Number(
			document
				.querySelector(`[data-card-id="${cardId}"]`)
				.querySelector("input[name='position']").value
		);

		if (newCardPosition === 0) {
			return (newCardPosition = 1);
		}

		const insertAfter = dropZone.parentElement.classList.contains(
			"cardWithDropZone"
		)
			? dropZone.parentElement
			: dropZone;

		updateListAndCardsPosition(
			newListId,
			cardId,
			newCardPosition,
			thisCardPosition
		);
		insertAfter.after(droppedCardElement);
	});

	return dropZone;
};

const updateListAndCardsPosition = async (
	newListId,
	cardId,
	newPosition,
	oldPosition
) => {
	try {
		//!on update toutes les positions de cette liste
		const newList = document.querySelector(`[data-list-id="${newListId}"]`);
		const allCardsInList = newList.querySelectorAll("[data-card-id");
		console.log(newPosition, oldPosition);

		allCardsInList.forEach(async (card) => {
			const thisCardIds = Number(card.dataset.cardId);
			const oldCardPositions = Number(
				card.querySelector("input[name='position']").value
			);
			console.log([thisCardIds, oldCardPositions]);

			if (newPosition < oldPosition) {
				if (oldCardPositions >= newPosition && oldCardPositions < oldPosition) {
					const updateThisCard = await fetch(
						`${index.base_url}/cards/${thisCardIds}`,
						{
							method: "PATCH",
							headers: {
								"Content-type": "application/json",
							},
							body: JSON.stringify({
								position: oldCardPositions + 1,
							}),
						}
					);
					console.log(updateThisCard);
					if (!updateThisCard.ok) {
						throw new Error("Problème avec le PATCH " + response.status);
					}
					return;
				}
			} else {
				if (oldCardPositions <= newPosition && oldCardPositions > oldPosition) {
					const updateThisCard = await fetch(
						`${index.base_url}/cards/${thisCardIds}`,
						{
							method: "PATCH",
							headers: {
								"Content-type": "application/json",
							},
							body: JSON.stringify({
								position: oldCardPositions - 1,
							}),
						}
					);
					console.log(updateThisCard);
					if (!updateThisCard.ok) {
						throw new Error("Problème avec le PATCH " + response.status);
					}
					return;
				}
			}
		});

		//! On update la position et la liste de la carte
		const updateThisCard = await fetch(`${index.base_url}/cards/${cardId}`, {
			method: "PATCH",
			body: JSON.stringify({
				position: newPosition,
				list_id: newListId,
			}),
			headers: {
				"Content-type": "application/json",
			},
		});
		console.log(updateThisCard);
		if (!updateThisCard.ok) {
			throw new Error("Problème avec le PATCH " + updateThisCard.status);
		}
	} catch (error) {
		console.error(error);
	}
};

export default createDropZone;
