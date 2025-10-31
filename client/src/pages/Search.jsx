import { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { userService } from '../services/userService';
import ProfileCard from '../components/dashboard/ProfileCard';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useAuthStore } from '../store/useStore';
import toast from 'react-hot-toast';

const Search = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const [filters, setFilters] = useState({
    gender: '',
    ageMin: '',
    ageMax: '',
    city: '',
    country: '',
    relationshipGoal: '',
    page: 1
  });

  // Vérifier si l'utilisateur est Premium
  const isPremium = user?.accountType === 'premium' || user?.accountType === 'vip';

  // Charger les utilisateurs au montage du composant et lors du changement de page
  useEffect(() => {
    searchUsers();
  }, [filters.page]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      
      // Construire les paramètres de requête (enlever les valeurs vides)
      const queryParams = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const response = await userService.searchUsers(queryParams);

      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } else {
        toast.error(response.message || 'Erreur lors de la recherche');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Réinitialiser à la page 1 lors du changement de filtre
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchUsers();
  };

  const handleResetFilters = () => {
    setFilters({
      gender: '',
      ageMin: '',
      ageMax: '',
      city: '',
      country: '',
      relationshipGoal: '',
      page: 1
    });
    setTimeout(() => searchUsers(), 100);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLike = async (profileId) => {
    try {
      // TODO: Implémenter la logique de like
      toast.success('Profil liké ! 💕');
    } catch (error) {
      toast.error('Erreur lors du like');
    }
  };

  const handleMessage = async (profileId) => {
    try {
      if (!isPremium) {
        toast.error('Fonctionnalité réservée aux membres Premium');
        return;
      }
      // TODO: Implémenter la logique de message
      toast.success('Redirection vers la conversation...');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Rechercher des profils</h1>
          <p className="text-gray-600">
            Trouvez des personnes qui correspondent à vos critères
          </p>
          {!isPremium && (
            <p className="text-sm text-orange-600 mt-2">
              ⭐ Passez à Premium pour accéder à la recherche avancée et aux filtres illimités
            </p>
          )}
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Barre de recherche ville */}
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                    placeholder="Rechercher par ville..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Bouton filtres */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center gap-2 px-6"
              >
                <Filter className="w-5 h-5" />
                Filtres {showFilters ? '▲' : '▼'}
              </button>

              {/* Bouton rechercher */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-8 disabled:opacity-50"
              >
                {loading ? 'Recherche...' : 'Rechercher'}
              </button>
            </div>

            {/* Panneau de filtres dépliable */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Genre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Genre
                    </label>
                    <select
                      name="gender"
                      value={filters.gender}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Tous</option>
                      <option value="homme">Homme</option>
                      <option value="femme">Femme</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  {/* Âge minimum */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Âge minimum
                    </label>
                    <input
                      type="number"
                      name="ageMin"
                      value={filters.ageMin}
                      onChange={handleFilterChange}
                      min="18"
                      max="99"
                      placeholder="18"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Âge maximum */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Âge maximum
                    </label>
                    <input
                      type="number"
                      name="ageMax"
                      value={filters.ageMax}
                      onChange={handleFilterChange}
                      min="18"
                      max="99"
                      placeholder="99"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Pays */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pays
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={filters.country}
                      onChange={handleFilterChange}
                      placeholder="Ex: Belgique"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Type de relation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recherche
                    </label>
                    <select
                      name="relationshipGoal"
                      value={filters.relationshipGoal}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Tous</option>
                      <option value="relation_serieuse">Relation sérieuse</option>
                      <option value="mariage">Mariage</option>
                      <option value="amitie">Amitié</option>
                      <option value="a_definir">À définir</option>
                    </select>
                  </div>

                  {/* Bouton réinitialiser */}
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Réinitialiser
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Résultats */}
        <div>
          {/* Compteur de résultats */}
          {!loading && users.length > 0 && (
            <p className="text-gray-600 mb-4">
              {pagination.total} profil{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
            </p>
          )}

          {/* État de chargement */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          )}

          {/* Grille de profils */}
          {!loading && users.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((profile) => (
                <ProfileCard
                  key={profile._id}
                  user={profile}
                  onLike={handleLike}
                  onMessage={handleMessage}
                  canMessage={isPremium}
                  isPremiumUser={isPremium}
                />
              ))}
            </div>
          )}

          {/* Aucun résultat */}
          {!loading && users.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <SearchIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Aucun profil trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <button
                onClick={handleResetFilters}
                className="btn-secondary"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>

              <div className="flex gap-2 flex-wrap">
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Search;