import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { userService } from '../services/userService'; 
import { useAuthStore } from '../store/useStore';
import PhotoUploader from '../components/PhotoUploader';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    location: {
      city: '',
      country: ''
    },
    height: '',
    education: '',
    occupation: '',
    relationshipGoal: '',
    lookingFor: {
      gender: [],
      ageRange: {
        min: 18,
        max: 99
      }
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: {
          city: user.location?.city || '',
          country: user.location?.country || ''
        },
        height: user.height || '',
        education: user.education || '',
        occupation: user.occupation || '',
        relationshipGoal: user.relationshipGoal || '',
        lookingFor: {
          gender: user.lookingFor?.gender || [],
          ageRange: {
            min: user.lookingFor?.ageRange?.min || 18,
            max: user.lookingFor?.ageRange?.max || 99
          }
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, ...rest] = name.split('.');
      
      if (rest.length === 1) {
        // Cas simple: location.city
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [rest[0]]: value
          }
        }));
      } else {
        // Cas imbriqué: lookingFor.ageRange.min
        const [child, grandchild] = rest;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandchild]: parseInt(value) || value
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleGenderPreferenceChange = (gender) => {
    setFormData(prev => ({
      ...prev,
      lookingFor: {
        ...prev.lookingFor,
        gender: prev.lookingFor.gender.includes(gender)
          ? prev.lookingFor.gender.filter(g => g !== gender)
          : [...prev.lookingFor.gender, gender]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      console.log('=== SOUMISSION DU PROFIL ===');
      console.log('Données avant nettoyage:', formData);
      
      // Nettoyer les données (retirer les champs vides)
      const cleanedData = {};
      
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        
        // Ne pas envoyer les valeurs vides
        if (value !== '' && value !== null && value !== undefined) {
          // Pour les objets
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Vérifier si l'objet a au moins une valeur non vide
            const hasValue = Object.values(value).some(v => {
              if (typeof v === 'object' && v !== null) {
                return Object.values(v).some(nested => 
                  nested !== '' && nested !== null && nested !== undefined
                );
              }
              return v !== '' && v !== null && v !== undefined;
            });
            
            if (hasValue) {
              cleanedData[key] = value;
            }
          } else {
            cleanedData[key] = value;
          }
        }
      });
      
      console.log('Données après nettoyage:', cleanedData);

      const response = await userService.updateProfile(cleanedData);
      
      if (response.success) {
        updateUser(response.data);
        toast.success('Profil mis à jour avec succès');
        navigate(`/profile/${user._id}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      console.error('Détails:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpdate = (data) => {
    updateUser({
      photos: data.photos,
      profilePhoto: data.profilePhoto
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* En-tête */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Éditer mon profil</h1>
          <div className="w-24"></div> {/* Spacer pour centrer le titre */}
        </div>

        {/* Photos - EN DEHORS DU FORMULAIRE */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <PhotoUploader
            photos={user?.photos || []}
            profilePhoto={user?.profilePhoto}
            onPhotoUpdate={handlePhotoUpdate}
          />
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations de base</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  min="100"
                  max="250"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio (500 caractères max)
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                maxLength="500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Parlez un peu de vous..."
              ></textarea>
              <p className="text-sm text-gray-500 mt-1">
                {formData.bio.length}/500 caractères
              </p>
            </div>
          </div>

          {/* Localisation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Localisation</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  name="location.country"
                  value={formData.location.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations professionnelles</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Éducation
                </label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ex: Master en Informatique"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profession
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ex: Développeur Web"
                />
              </div>
            </div>
          </div>

          {/* Préférences de recherche */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Je recherche</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de relation
                </label>
                <select
                  name="relationshipGoal"
                  value={formData.relationshipGoal}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sélectionner...</option>
                  <option value="relation_serieuse">Relation sérieuse</option>
                  <option value="mariage">Mariage</option>
                  <option value="amitie">Amitié</option>
                  <option value="a_definir">À définir</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre recherché
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.lookingFor.gender.includes('homme')}
                      onChange={() => handleGenderPreferenceChange('homme')}
                      className="mr-2"
                    />
                    Homme
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.lookingFor.gender.includes('femme')}
                      onChange={() => handleGenderPreferenceChange('femme')}
                      className="mr-2"
                    />
                    Femme
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.lookingFor.gender.includes('autre')}
                      onChange={() => handleGenderPreferenceChange('autre')}
                      className="mr-2"
                    />
                    Autre
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Âge minimum
                  </label>
                  <input
                    type="number"
                    name="lookingFor.ageRange.min"
                    value={formData.lookingFor.ageRange.min}
                    onChange={handleChange}
                    min="18"
                    max="99"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Âge maximum
                  </label>
                  <input
                    type="number"
                    name="lookingFor.ageRange.max"
                    value={formData.lookingFor.ageRange.max}
                    onChange={handleChange}
                    min="18"
                    max="99"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;