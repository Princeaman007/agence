import { useState, useRef } from 'react';
import { Upload, X, Star, Loader2 } from 'lucide-react';
import { userService } from '../services/userService';
import { useAuthStore } from '../store/useStore';
import toast from 'react-hot-toast';

const PhotoUploader = ({ photos = [], profilePhoto, onPhotoUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const fileInputRef = useRef(null);
  const { updateUser } = useAuthStore();

  // ✅ CORRECTION : Utiliser VITE_BASE_URL pour les images
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

  // Gérer la sélection de fichier
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Seules les images (JPEG, PNG, GIF, WEBP) sont autorisées');
      return;
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La taille de l\'image ne doit pas dépasser 5MB');
      return;
    }

    // Vérifier la limite de 6 photos
    if (photos.length >= 6) {
      toast.error('Vous avez atteint la limite de 6 photos');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('photo', file);
      
      console.log('Upload de la photo...');
      console.log('File:', file.name, file.type, file.size);
      
      const response = await userService.uploadPhoto(formData);

      if (response.success) {
        toast.success('Photo uploadée avec succès');
        
        // Mettre à jour le store
        updateUser({
          photos: response.data.photos,
          profilePhoto: response.data.profilePhoto
        });

        // Callback pour mettre à jour le parent
        if (onPhotoUpdate) {
          onPhotoUpdate(response.data);
        }
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      console.error('Détails:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Supprimer une photo
  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
      return;
    }

    try {
      setDeleting(photoId);
      const response = await userService.deletePhoto(photoId);

      if (response.success) {
        toast.success('Photo supprimée avec succès');
        
        // Mettre à jour le store
        updateUser({
          photos: response.data.photos,
          profilePhoto: response.data.profilePhoto
        });

        // Callback
        if (onPhotoUpdate) {
          onPhotoUpdate(response.data);
        }
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  // Définir comme photo de profil
  const handleSetProfilePhoto = async (photoId) => {
    try {
      const response = await userService.setProfilePhoto(photoId);

      if (response.success) {
        toast.success('Photo de profil mise à jour');
        
        // Mettre à jour le store
        updateUser({
          profilePhoto: response.data.profilePhoto
        });

        // Callback
        if (onPhotoUpdate) {
          onPhotoUpdate(response.data);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="space-y-4">
      {/* Titre */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Mes photos ({photos.length}/6)
        </h3>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || photos.length >= 6}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Upload...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Ajouter une photo
            </>
          )}
        </button>
      </div>

      {/* Input caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Grille de photos */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div
            key={photo._id}
            className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
          >
            {/* Image - ✅ CORRECTION : Utiliser BASE_URL */}
            <img
              src={`${BASE_URL}${photo.url}`}
              alt="Photo de profil"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Erreur chargement image:', `${BASE_URL}${photo.url}`);
                console.error('Photo object:', photo);
                e.target.src = 'https://via.placeholder.com/400?text=Image+non+disponible';
              }}
            />

            {/* Badge photo de profil */}
            {profilePhoto === photo.url && (
              <div className="absolute top-2 left-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Profil
              </div>
            )}

            {/* Overlay avec actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              {/* Bouton définir comme photo de profil */}
              {profilePhoto !== photo.url && (
                <button
                  type="button"
                  onClick={() => handleSetProfilePhoto(photo._id)}
                  className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="Définir comme photo de profil"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}

              {/* Bouton supprimer */}
              <button
                type="button"
                onClick={() => handleDeletePhoto(photo._id)}
                disabled={deleting === photo._id}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                title="Supprimer"
              >
                {deleting === photo._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}

        {/* Placeholder pour ajouter des photos */}
        {photos.length < 6 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-8 h-8" />
            <span className="text-sm">Ajouter</span>
          </button>
        )}
      </div>

      {/* Message d'information */}
      <p className="text-sm text-gray-500">
        Vous pouvez uploader jusqu'à 6 photos. Formats acceptés : JPEG, PNG, GIF, WEBP (5MB max par photo).
      </p>
    </div>
  );
};

export default PhotoUploader;