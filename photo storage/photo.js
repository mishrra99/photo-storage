document.getElementById('uploadButton').addEventListener('click', function() {
    const userName = document.getElementById('userName').value.trim();
    const instagramId = document.getElementById('instagramId').value.trim();
    const sortlistInput = document.getElementById('sortlistInput').value.trim();
    const photoInput = document.getElementById('photoInput');
    if (!userName || !instagramId || !sortlistInput) {
        alert('Please enter your name, Instagram ID, and sortlist name.');
        return;
    }
    if (photoInput.files && photoInput.files[0]) {
        const file = photoInput.files[0];
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(file.type)) {
            alert('Please upload a valid image file (.jpg, .png, .gif).');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoItem = {
                src: e.target.result,
                userName: userName,
                instagramId: instagramId,
                sortlist: sortlistInput
            };
            savePhotoToLocalStorage(photoItem);
            displayPhotos();
        };
        reader.readAsDataURL(file);
        photoInput.value = ''; 
        document.getElementById('userName').value = ''; 
        document.getElementById('instagramId').value = ''; 
        document.getElementById('sortlistInput').value = ''; 
    } else {
        alert('Please select a photo to upload.');
    }
});

function savePhotoToLocalStorage(photoItem) {
    let photos = JSON.parse(localStorage.getItem('photos')) || [];
    photos.push(photoItem);
    localStorage.setItem('photos', JSON.stringify(photos));
}

function displayPhotos() {
    const photoGallery = document.getElementById('photoGallery');
    photoGallery.innerHTML = '';

    const photos = JSON.parse(localStorage.getItem('photos')) || [];
    const groupedPhotos = groupPhotosBySortlist(photos);

    for (const sortlist in groupedPhotos) {
        const sortlistDiv = document.createElement('div');
        sortlistDiv.className = 'sortlist';

        const sortlistTitle = document.createElement('h3');
        sortlistTitle.innerText = sortlist;

        const coverPhoto = document.createElement('img');
        coverPhoto.src = groupedPhotos[sortlist][0].src; 
        coverPhoto.className = 'cover-photo';

        sortlistTitle.className = 'sortlist-title';
        sortlistTitle.onclick = function() {
            const photosContainer = this.nextElementSibling;
            photosContainer.style.display = photosContainer.style.display === 'none' ? 'block' : 'none';
            coverPhoto.style.display = photosContainer.style.display === 'none' ? 'block' : 'none';
        };

        sortlistDiv.appendChild(coverPhoto);
        sortlistDiv.appendChild(sortlistTitle);

        const photosContainer = document.createElement('div');
        photosContainer.className = 'sortlist-photos';
        groupedPhotos[sortlist].forEach(photo => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';

            const img = document.createElement('img');
            img.src = photo.src;
            img.alt = 'Uploaded Photo';

            const tooltip = document.createElement('span');
            tooltip.className = 'tooltip';
            tooltip.innerText = 'Click on me';

            img.onmouseover = function() {
                tooltip.style.display = 'block';
            };

            img.onmouseout = function() {
                tooltip.style.display = 'none';
            };

            img.onclick = function() {
                window.open(`https://www.instagram.com/${photo.instagramId}`, '_blank');
            };

            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'Delete';
            deleteButton.onclick = function() {
                const confirmation = confirm('Are you sure you want to delete this photo?');
                if (confirmation) {
                    const enteredName = prompt('Please enter your key to confirm deletion:');
                    if (enteredName === photo.userName) {
                        deletePhotoFromLocalStorage(photo);
                        displayPhotos(); 
                    } else {
                        alert('You are not authorized to delete this photo.');
                    }
                }
            };
            photoItem.appendChild(img);
            photoItem.appendChild(tooltip);
            photoItem.appendChild(deleteButton);
            photosContainer.appendChild(photoItem);
        });
        sortlistDiv.appendChild(photosContainer);
        photoGallery.appendChild(sortlistDiv);
    }
}
function groupPhotosBySortlist(photos) {
    return photos.reduce((acc, photo) => {
        if (!acc[photo.sortlist]) {
            acc[photo.sortlist] = [];
        }
        acc[photo.sortlist].push(photo);
        return acc;
    }, {});
}
function deletePhotoFromLocalStorage(photoToDelete) {
    let photos = JSON.parse(localStorage.getItem('photos')) || [];
    photos = photos.filter(photo => photo.src !== photoToDelete.src); 
    localStorage.setItem('photos', JSON.stringify(photos));
}
window.onload = function() {
    displayPhotos();
};