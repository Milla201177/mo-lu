const popupImgCloseElement = document.querySelector('.popup__close_type_img');
const popupImgElement = document.querySelector('.popup_type_img');
const popupImg = popupImgElement.querySelector('.popup__img');
const cardImg = document.querySelectorAll('.card__img');

function openPopup (item) {
    item.classList.add('popup_opened');
    document.addEventListener('keydown', closePopupByKeydownOnESC);
    item.addEventListener('click', closePopupByClickOnOverlay);
}

function closePopup (item) {
    item.classList.remove('popup_opened');
    document.removeEventListener('keydown', closePopupByKeydownOnESC);
    item.removeEventListener('click', closePopupByClickOnOverlay);
}

function OpenCardImg(evt) {
    const targetImage = evt.target;
    openPopup(popupImgElement);
    popupImg.src = targetImage.src;
}

cardImg.forEach(function (img) {
    img.addEventListener('click', OpenCardImg);
})

popupImgCloseElement.addEventListener('click', () => {
    closePopup(popupImgElement)
})

const closePopupByKeydownOnESC = function (evt) {
    if (evt.key !== 'Escape') {
        return;
    }
    const popupOpened = document.querySelector('.popup_opened');
    closePopup(popupOpened);
};

const closePopupByClickOnOverlay = function (evt) {
    if (evt.target !== evt.currentTarget) {
        return;
    }
    const popupOpened = document.querySelector('.popup_opened');
    closePopup(popupOpened);
};











