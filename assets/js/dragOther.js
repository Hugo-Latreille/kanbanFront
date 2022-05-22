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
		const dropZoneIndex = dropZonesInList.indexOf(dropZone) + 1;
		const cardId = Number(e.dataTransfer.getData("text/plain"));

		const droppedCardElement = document.querySelector(
			`[data-card-id="${cardId}"]`
		).parentElement;
		const thisCardPosition = Number(
			document
				.querySelector(`[data-card-id="${cardId}"]`)
				.querySelector("input[name='position']").value
		);

		const insertAfter = dropZone.parentElement.classList.contains(
			"cardWithDropZone"
		)
			? dropZone.parentElement
			: dropZone;

		updateListAndCardsPosition(
			newListId,
			cardId,
			dropZoneIndex,
			thisCardPosition
		);
		// updateCardsPositionAPI(cardId, dropZoneIndex, newListId, thisCardPosition);
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
		const allCardsInList = newList.querySelectorAll("[data-card-id]");

		let goodNewPosition = newPosition - 1;

		if (goodNewPosition === 0) {
			goodNewPosition = 1;
		}

		const oldList = await fetch(`${index.base_url}/cards/${cardId}`);
		if (!oldList.ok) {
			throw new Error("Problème avec le GET " + oldList.status);
		}
		const oldListData = await oldList.json();

		if (oldListData.list_id === newListId) {
			console.log("même liste");
			allCardsInList.forEach(async (card) => {
				const thisCardIds = Number(card.dataset.cardId);
				const oldCardPositions = Number(
					card.querySelector("input[name='position']").value
				);

				if (newPosition < oldPosition) {
					if (
						oldCardPositions >= newPosition &&
						oldCardPositions < oldPosition
					) {
						const updateCards = await fetch(
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
						console.log(updateCards);
						if (!updateCards.ok) {
							throw new Error("Problème avec le PATCH " + response.status);
						}
						const updateThisCard = await fetch(
							`${index.base_url}/cards/${cardId}`,
							{
								method: "PATCH",
								body: JSON.stringify({
									position: newPosition,
								}),
								headers: {
									"Content-type": "application/json",
								},
							}
						);
						console.log(updateThisCard);
						if (!updateThisCard.ok) {
							throw new Error(
								"Problème avec le PATCH " + updateThisCard.status
							);
						}
						//! on met à jour la position de la carte sans refresh
						card
							.querySelector("input[name='position']")
							.setAttribute("value", `${oldCardPositions + 1}`);
						document
							.querySelector(`[data-card-id="${cardId}"]`)
							.querySelector("input[name='position']")
							.setAttribute("value", `${newPosition}`);
						return;
					}
				}

				if (goodNewPosition > oldPosition) {
					if (
						oldCardPositions <= goodNewPosition &&
						oldCardPositions > oldPosition
					) {
						const updateCards = await fetch(
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
						console.log(updateCards);
						if (!updateCards.ok) {
							throw new Error("Problème avec le PATCH " + response.status);
						}
						const updateThisCard = await fetch(
							`${index.base_url}/cards/${cardId}`,
							{
								method: "PATCH",
								body: JSON.stringify({
									position: goodNewPosition, //
								}),
								headers: {
									"Content-type": "application/json",
								},
							}
						);
						console.log(updateThisCard);
						if (!updateThisCard.ok) {
							throw new Error(
								"Problème avec le PATCH " + updateThisCard.status
							);
						}

						card
							.querySelector("input[name='position']")
							.setAttribute("value", `${oldCardPositions - 1}`);
						document
							.querySelector(`[data-card-id="${cardId}"]`)
							.querySelector("input[name='position']")
							.setAttribute("value", `${goodNewPosition}`);
						return;
					}
				}
			});
			return;
		}
		if (oldListData.list_id !== newListId) {
			console.log("autre liste");

			const oldList = document.querySelector(
				`[data-list-id="${oldListData.list_id}"]`
			);
			const allCardsInOldList = oldList.querySelectorAll("[data-card-id]");

			const updateThisCard = await fetch(`${index.base_url}/cards/${cardId}`, {
				method: "PATCH",
				body: JSON.stringify({
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
			//* ANCIENNE LISTE
			allCardsInOldList.forEach(async (card) => {
				const thisCardId = Number(card.dataset.cardId);
				const oldCardPosition = Number(
					card.querySelector("input[name='position']").value
				);
				if (oldCardPosition > oldPosition) {
					console.log(card);
					const updateCards = await fetch(
						`${index.base_url}/cards/${thisCardId}`,
						{
							method: "PATCH",
							headers: {
								"Content-type": "application/json",
							},
							body: JSON.stringify({
								position: oldCardPosition - 1,
							}),
						}
					);
					console.log(updateCards);
					if (!updateCards.ok) {
						throw new Error("Problème avec le PATCH " + response.status);
					}
					//! on met à jour la position des cartes qui restent sans refresh
					card
						.querySelector("input[name='position']")
						.setAttribute("value", `${oldCardPosition - 1}`);
				}
			});

			//* NOUVELLE LISTE
			allCardsInList.forEach(async (card) => {
				const thisCardId = Number(card.dataset.cardId);
				const oldCardPosition = Number(
					card.querySelector("input[name='position']").value
				);

				console.log(oldCardPosition, newPosition);
				if (oldCardPosition >= newPosition) {
					const updateCards = await fetch(
						`${index.base_url}/cards/${thisCardId}`,
						{
							method: "PATCH",
							headers: {
								"Content-type": "application/json",
							},
							body: JSON.stringify({
								position: oldCardPosition + 1,
							}),
						}
					);
					console.log(updateCards);
					if (!updateCards.ok) {
						throw new Error("Problème avec le PATCH " + response.status);
					}
					//! on met à jour la position de la carte sans refresh
					card
						.querySelector("input[name='position']")
						.setAttribute("value", `${oldCardPosition + 1}`);
				}
				const updateThisCardId = await fetch(
					`${index.base_url}/cards/${cardId}`,
					{
						method: "PATCH",
						body: JSON.stringify({
							position: newPosition,
						}),
						headers: {
							"Content-type": "application/json",
						},
					}
				);
				console.log(updateThisCardId);
				if (!updateThisCardId.ok) {
					throw new Error("Problème avec le PATCH " + updateThisCardId.status);
				}
				document
					.querySelector(`[data-card-id="${cardId}"]`)
					.querySelector("input[name='position']")
					.setAttribute("value", `${newPosition}`);
			});
		}
	} catch (error) {
		console.error(error);
	}
};

const updateCardsPositionAPI = async (
	cardId,
	newPosition,
	newListId,
	oldPosition
) => {
	let goodNewPosition = newPosition - 1;

	if (goodNewPosition === 0) {
		goodNewPosition = 1;
	}

	console.log(cardId, oldPosition, goodNewPosition, newListId);

	const updatePosition = await fetch(
		`${index.base_url}/cards/${cardId}/position/${goodNewPosition}`,
		{
			method: "PATCH",
		}
	);
	const updatePositionData = await updatePosition.json();
	console.log(updatePositionData);

	const updateThisCard = await fetch(`${index.base_url}/cards/${cardId}`, {
		method: "PATCH",
		body: JSON.stringify({
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
	document.location.reload();
};

export default createDropZone;
