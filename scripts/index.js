const popupImgElement = document.querySelector('.popup_type_img');
const popupImg = popupImgElement?.querySelector('.popup__img');
const popupImgCloseElement = popupImgElement?.querySelector('.popup__close_type_img');
const cardImages = Array.from(document.querySelectorAll('.card__img'));
const headerElement = document.querySelector('.header');
const homePagePath = '../../index.html';

let currentImageIndex = 0;
let popupPrevButton;
let popupNextButton;
let touchStartX = 0;
let touchStartY = 0;
let pointerStartX = 0;
let pointerStartY = 0;
let activePointerId = null;

const SWIPE_MIN_DISTANCE = 48;
const SWIPE_MAX_OFF_AXIS_DISTANCE = 80;

function openPopup(item) {
    if (!item) {
        return;
    }

    item.classList.add('popup_opened');
    document.addEventListener('keydown', handlePopupKeydown);
    item.addEventListener('click', closePopupByClickOnOverlay);
    document.body.classList.add('page_locked');
}

function closePopup(item) {
    if (!item) {
        return;
    }

    item.classList.remove('popup_opened');
    document.removeEventListener('keydown', handlePopupKeydown);
    item.removeEventListener('click', closePopupByClickOnOverlay);
    document.body.classList.remove('page_locked');
}

function updatePopupNavigationState() {
    if (!popupPrevButton || !popupNextButton) {
        return;
    }

    const isGallerySingleImage = cardImages.length <= 1;

    popupPrevButton.disabled = isGallerySingleImage;
    popupNextButton.disabled = isGallerySingleImage;
    popupPrevButton.hidden = isGallerySingleImage;
    popupNextButton.hidden = isGallerySingleImage;
}

function updatePopupImage(index) {
    if (!popupImg || !cardImages.length) {
        return;
    }

    currentImageIndex = (index + cardImages.length) % cardImages.length;

    const currentImage = cardImages[currentImageIndex];
    const safeAlt = currentImage.alt && currentImage.alt !== '#'
        ? currentImage.alt
        : `Gallery image ${currentImageIndex + 1}`;

    popupImg.src = currentImage.currentSrc || currentImage.src;
    popupImg.alt = safeAlt;
    popupImg.dataset.index = String(currentImageIndex);

    updatePopupNavigationState();
}

function openCardImage(evt) {
    const imageIndex = cardImages.indexOf(evt.currentTarget);

    if (imageIndex === -1 || !popupImgElement) {
        return;
    }

    updatePopupImage(imageIndex);
    openPopup(popupImgElement);
}

function showNextImage(step) {
    if (!popupImgElement?.classList.contains('popup_opened') || cardImages.length <= 1) {
        return;
    }

    updatePopupImage(currentImageIndex + step);
}

function handlePopupKeydown(evt) {
    if (evt.key === 'Escape') {
        const popupOpened = document.querySelector('.popup_opened');
        closePopup(popupOpened);
        return;
    }

    if (evt.key === 'ArrowLeft') {
        showNextImage(-1);
    }

    if (evt.key === 'ArrowRight') {
        showNextImage(1);
    }
}

function closePopupByClickOnOverlay(evt) {
    if (evt.target !== evt.currentTarget) {
        return;
    }

    const popupOpened = document.querySelector('.popup_opened');
    closePopup(popupOpened);
}

function createNavigationButton(direction, label, step) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `popup__nav popup__nav_type_${direction} content__button`;
    button.setAttribute('aria-label', label);
    button.innerHTML = `<span class="popup__nav-icon" aria-hidden="true">${direction === 'prev' ? '&#10094;' : '&#10095;'}</span>`;
    button.addEventListener('click', (evt) => {
        evt.stopPropagation();
        showNextImage(step);
    });

    return button;
}

function handleTouchStart(evt) {
    const [touch] = evt.changedTouches;

    if (!touch) {
        return;
    }

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function handleTouchEnd(evt) {
    const [touch] = evt.changedTouches;

    if (!touch || !popupImgElement?.classList.contains('popup_opened')) {
        return;
    }

    handleSwipe(touch.clientX - touchStartX, touch.clientY - touchStartY);
}

function handleSwipe(deltaX, deltaY) {
    if (!popupImgElement?.classList.contains('popup_opened')) {
        return;
    }

    if (Math.abs(deltaX) < SWIPE_MIN_DISTANCE || Math.abs(deltaY) > SWIPE_MAX_OFF_AXIS_DISTANCE) {
        return;
    }

    showNextImage(deltaX < 0 ? 1 : -1);
}

function handlePointerDown(evt) {
    if (evt.isPrimary === false || evt.pointerType === 'mouse') {
        return;
    }

    activePointerId = evt.pointerId;
    pointerStartX = evt.clientX;
    pointerStartY = evt.clientY;

    if (evt.currentTarget.setPointerCapture) {
        evt.currentTarget.setPointerCapture(evt.pointerId);
    }
}

function handlePointerUp(evt) {
    if (activePointerId !== evt.pointerId) {
        return;
    }

    handleSwipe(evt.clientX - pointerStartX, evt.clientY - pointerStartY);
    activePointerId = null;
}

function handlePointerCancel(evt) {
    if (activePointerId === evt.pointerId) {
        activePointerId = null;
    }
}

function enhanceImagePopup() {
    if (!popupImgElement || !popupImg || !popupImgCloseElement) {
        return;
    }

    const popupContainer = popupImgElement.querySelector('.popup__container-type-img');

    if (!popupContainer) {
        return;
    }

    popupPrevButton = createNavigationButton('prev', 'Previous image', -1);
    popupNextButton = createNavigationButton('next', 'Next image', 1);

    popupImgCloseElement.setAttribute('aria-label', 'Close gallery');
    popupImgCloseElement.addEventListener('click', () => {
        closePopup(popupImgElement);
    });
    if (window.PointerEvent) {
        popupContainer.addEventListener('pointerdown', handlePointerDown);
        popupContainer.addEventListener('pointerup', handlePointerUp);
        popupContainer.addEventListener('pointercancel', handlePointerCancel);
    } else {
        popupContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
        popupContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    popupContainer.append(popupPrevButton, popupNextButton);
    updatePopupNavigationState();
}

function enhanceAlbumNavigation() {
    const albumTitle = document.querySelector('.profile__title');
    const homeLink = headerElement?.querySelector('.profile__name[href]');

    if (!headerElement || !albumTitle || !homeLink) {
        return;
    }

    const backLink = document.createElement('a');
    backLink.className = 'header__back';
    backLink.href = homePagePath;
    backLink.textContent = 'Back';
    backLink.setAttribute('aria-label', 'Back');

    headerElement.prepend(backLink);
}

function splitProfileLabel(text) {
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    const separatorMatch = normalizedText.match(/^(.+?)(\s*[—-]\s*)(.+)$/);

    if (separatorMatch) {
        return {
            label: separatorMatch[1].trim(),
            separator: ' - ',
            rest: separatorMatch[3].trim(),
        };
    }

    const keywordMatch = normalizedText.match(/^(Director|Set|Light(?:ing)?|Composer|Video(?: and Lighting)?|Video artist(?:s)?|Sound design|Costume designer|Set designers|Set & costume designer|Set & costumes design|Multimedia director|multimedia director|Photographer|Scenario|Choreographer|Musical designer|illustrator|choreograph|Object and costume design|inclusive theatre project|theater|Theater)\b/i);

    if (!keywordMatch) {
        return null;
    }

    const nameStartMatch = normalizedText.slice(keywordMatch[0].length).match(/\s+(?=[A-ZА-ЯЁ][^\s]+(?:\s+[A-ZА-ЯЁ(][^\s]+)?)/);

    if (!nameStartMatch) {
        return {
            label: normalizedText,
            separator: '',
            rest: '',
        };
    }

    const splitIndex = keywordMatch[0].length + nameStartMatch.index;

    return {
        label: normalizedText.slice(0, splitIndex).trim(),
        separator: ' - ',
        rest: normalizedText.slice(splitIndex).trim(),
    };
}

function appendVenueHighlight(link, text) {
    const venueMatch = text.match(/\b(Theater|Theatre|theater|theatre)\b/);

    if (!venueMatch || typeof venueMatch.index !== 'number') {
        return false;
    }

    const before = text.slice(0, venueMatch.index);
    const venueWord = venueMatch[0];
    const after = text.slice(venueMatch.index + venueWord.length);
    const roleSpan = document.createElement('span');

    roleSpan.className = 'profile__link-role';
    roleSpan.textContent = venueWord.charAt(0).toUpperCase() + venueWord.slice(1);

    link.textContent = '';
    link.append(document.createTextNode(before));
    link.append(roleSpan);
    link.append(document.createTextNode(after));

    return true;
}

function enhanceAlbumMetadata() {
    const albumTitle = document.querySelector('.profile__title');
    const profileLinks = Array.from(document.querySelectorAll('.profile__link'));

    if (!albumTitle || !profileLinks.length) {
        return;
    }

    document.body.classList.add('page_album');

    profileLinks.forEach((link) => {
        const text = (link.textContent || '').replace(/\s+/g, ' ').trim();
        const parts = splitProfileLabel(text);

        if (!parts || !parts.label) {
            appendVenueHighlight(link, text);
            return;
        }

        const roleSpan = document.createElement('span');
        roleSpan.className = 'profile__link-role';
        roleSpan.textContent = parts.label;

        link.textContent = '';
        link.append(roleSpan);

        if (parts.separator) {
            link.append(document.createTextNode(parts.separator));
        }

        if (parts.rest) {
            link.append(document.createTextNode(parts.rest));
        }
    });
}

if (cardImages.length) {
    cardImages.forEach((img) => {
        img.addEventListener('click', openCardImage);
    });
}

enhanceAlbumNavigation();
enhanceAlbumMetadata();
enhanceImagePopup();
