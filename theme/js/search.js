$(document).ready(function() {
    // Empêcher le rechargement de la page lors de la soumission du formulaire
    $('.search-wrapper').on('submit', function(e) {
        e.preventDefault();
    });

    // Fonction de recherche dynamique
    $('#cyber-search').on('input', function() {
        var searchTerm = $(this).val().toLowerCase().trim();
        
        if (searchTerm) {
            // Vide les résultats précédents
            $('#search-results').empty();
            
            // Recherche dans les éléments du texte
            $('.card-text').each(function() {
                var content = $(this).text().toLowerCase();
                if (content.includes(searchTerm)) {
                    var cardTitle = $(this).siblings('.card-title').text();
                    $('#search-results').append(`<p><strong>${cardTitle} :</strong> ${$(this).text()}</p>`);
                }
            });

            // Si aucun résultat n'est trouvé
            if ($('#search-results').is(':empty')) {
                $('#search-results').html("<p>Aucun résultat trouvé.</p>");
            }
        } else {
            $('#search-results').html("<p>Veuillez entrer un terme de recherche valide.</p>");
        }
    });
});
