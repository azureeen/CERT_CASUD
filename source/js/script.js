const { reload } = require("browser-sync");

(function ($) {
    'use strict';

    // Preloader js    
    $(window).on('load', function () {
        $('.preloader').fadeOut(100);

        // masonry
        $('.masonry-wrapper').masonry({
            columnWidth: 1
        });
    });

    // navfixed
    $(window).scroll(function () {
        if ($('.navigation').offset().top > 50) {
            $('.navigation').addClass('nav-bg');
        } else {
            $('.navigation').removeClass('nav-bg');
        }
    });

    // clipboard
    var clipInit = false;
    var clip; // Declare ClipboardJS once outside of the loop
    $('code').each(function () {
        var code = $(this),
            text = code.text();
        if (text.length > 2) {
            if (!clipInit) {
                clip = new ClipboardJS('.copy-to-clipboard', {
                    text: function (trigger) {
                        return $(trigger).prev('code').text().replace(/^\$\s/gm, '');
                    }
                });
                clipInit = true;
            }
            code.after('<span class="copy-to-clipboard">copy</span>');
        }
    });

    $('.copy-to-clipboard').click(function () {
        $(this).html('copied');
    });

    // match height
    $(function () {
        $('.match-height').matchHeight({
            byRow: true,
            property: 'height',
            target: null,
            remove: false
        });
    });

    // search
    $('#search-by').keyup(function () {
        if (this.value) {
            $(this).addClass('active');
        } else {
            $(this).removeClass('active');
        }
    });

    // navbar
    $('.navbar-burger').click(function () {
        $('.navbar-burger').toggleClass('is-active');
        $('.navbar-menu').toggleClass('is-active');

        $(this).attr('data-hidden', $(this).attr('data-hidden') === 'true' ? 'false' : 'true');
    });

    // tab
    $('.tab-content').find('.tab-pane').each(function (idx, item) {
        var navTabs = $(this).closest('.code-tabs').find('.nav-tabs'),
            title = $(this).attr('title');
        navTabs.append('<li class="control"><a class="button" href="#">' + title + '</a></li>');
    });

    $('.code-tabs ul.nav-tabs').each(function () {
        $(this).find('li:first').addClass('active');
    });

    $('.code-tabs .tab-content').each(function () {
        $(this).find('div:first').addClass('active').show();
    });

    $('.nav-tabs a').click(function (e) {
        e.preventDefault();
        var tab = $(this).parent(),
            tabIndex = tab.index(),
            tabPanel = $(this).closest('.code-tabs'),
            tabPane = tabPanel.find('.tab-pane').eq(tabIndex);
        tabPanel.find('.active').removeClass('active');
        tab.addClass('active');
        tabPane.addClass('active');
    });

    // JSAccordion/Collapse
    $.fn.collapsible = function() {
        var ns = {
            open: function (me, bypass) { // Open the target
                var conf = me[0].__collapsible;
                if (!conf) { return; }
                if (bypass !== true) {
                    if (typeof conf.group === 'string') {
                        if (String(conf.allowMultiple).toLowerCase() !== 'true') {
                            window['collapsibleAnimations_' + conf.group] = 0;
                            window['collapsibleGroup_' + conf.group] = $('[data-group="' + conf.group + '"]').not(me);
                            var group = window['collapsibleGroup_' + conf.group];
                            group.each(function () { ns.close($(this)); });
                            ns.open(me, true);
                            return;
                        }
                    }
                }
                me.trigger('before:open');
                me.attr('aria-expanded', true);
                conf.target.attr('aria-expanded', true);
                conf.expanded = true;
                me.trigger('open');
                if (conf.init !== true) {
                    setTimeout(function () {
                        conf.init = true;
                        me.__collapsible = conf;
                    }, conf.speed + 100);
                }
            },
            close: function (me) { // Close the target
                var conf = me[0].__collapsible;
                if (!conf) { return; }
                me.trigger('before:close');
                me.attr('aria-expanded', false);
                conf.target.attr('aria-expanded', false);
                conf.expanded = false;
                me.trigger('close');
                if (conf.init !== true) {
                    setTimeout(function () {
                        conf.init = true;
                        me.__collapsible = conf;
                    }, conf.speed + 100);
                }
            },
            toggle: function (me) { // Toggle the target open/close
                var conf = me[0].__collapsible;
                if (!conf) { return; }
                me.trigger('before:toggle');
                var active = String(me.attr('aria-expanded')).toLowerCase();
                active = (active === 'true') ? true : false;
                if (active === true) {
                    ns.close(me);
                } else {
                    ns.open(me);
                }
                me.trigger('toggle');
            },
            onClick: function (e) { // On click handler
                if (!e.target.__collapsible) { return; }
                if ($(e.target).is('a')) {
                    e.preventDefault();
                }
                ns.toggle($(e.target));
            },
            onClose: function (e) { // On close handler
                if (!e.target.__collapsible) { return; }
                var me = e.target;
                var targ = me.__collapsible.target;
                targ.stop().slideUp(me.__collapsible.speed, function () {
                    $(me).trigger('after:close');
                    $(me).trigger('animation:complete', ['close']);
                    window['collapsibleAnimations_' + me.__collapsible.group] += 1;
                    var count = window['collapsibleAnimations_' + me.__collapsible.group];
                    var group = window['collapsibleGroup_' + me.__collapsible.group];
                    if (!group) { return; }
                    if (count >= group.length) {
                        $('[data-group="' + me.__collapsible.group + '"]:focus').trigger('animations:complete', ['close']);
                    }
                });
            },
            onOpen: function (e) { // On open handler
                if (!e.target.__collapsible) { return; }
                var me = e.target;
                var targ = me.__collapsible.target;
                targ.stop().slideDown(me.__collapsible.speed, function () {
                    $(me).trigger('after:open');
                    $(me).trigger('animation:complete', ['open']);

                    if (me.__collapsible.init === true) {
                        if (String(me.__collapsible.allowMultiple).toLowerCase() === 'true') {
                            $(me).trigger('animations:complete', ['open']);
                        }
                    }
                });
            }
        };

        if (typeof arguments[0] === 'string') { // Public Methods
            switch (String(arguments[0]).toLowerCase()) {
                case 'open':
                case 'show':
                    this.each(function () { ns.open($(this)); });
                    break;
                case 'close':
                case 'hide':
                    this.each(function () { ns.close($(this)); });
                    break;
                case 'toggle':
                    this.each(function () { ns.toggle($(this)); });
                    break;
            }
            return this;
        } else { // Initialization
            // Event listeners
            this.on('click', ns.onClick);
            this.on('open', ns.onOpen);
            this.on('close', ns.onClose);
            var defaultConfig = $.extend({
                allowMultiple: false,
                expanded: false,
                group: null,
                init: false,
                speed: 250,
                target: null,
                temp: {}
            }, arguments[0]);

            // Constructor
            this.each(function (i) {
                // Default config
                var config = $.extend({}, defaultConfig);
                // update the config with data attributes
                var data = $(this).data();
                for (var prop in defaultConfig) {
                    if (data[prop]) { config[prop] = data[prop]; }
                }
                // If the element is an <a> tag -> use the href attribute
                if ($(this).is('a')) {
                    config.target = $(this).attr('href') || config.target;
                }
                // Exit if no target specified
                if (!config.target || config.target === null) { return; }
                // Convert the target into a jQuery object
                config.target = $(config.target);
                // Set the expanded value
                config.expanded = $(this).attr('aria-expanded') || config.expanded;
                config.expanded = (typeof config.expanded === 'string') ? config.expanded.toLowerCase() : config.expanded;
                config.expanded = (config.expanded === 'true') ? true : config.expanded;
                // temp storage object
                config.temp = {animations: 0, group: null};
                // Initialize
                this.__collapsible = config;
                // Open/close any elements
                if (config.expanded === true) {
                    ns.open($(this));
                } else {
                    ns.close($(this));
                }
            });
            // Return the query
            return this;
        }
    };

    // Default initializer
    $('[data-toggle="collapse"]').collapsible();

    // Accordions
    $('[data-toggle="collapse"]').on('click', function() {
        if ($(this).attr('aria-expanded') === 'true') {
            $(this).children('.ti-plus').removeClass('ti-plus').addClass('ti-minus');
        } else {
            $(this).children('.ti-minus').removeClass('ti-minus').addClass('ti-plus');
        }
    });

})(jQuery);


document.addEventListener('DOMContentLoaded', () => {
         // 1) La liste ordonnée de tous tes documents
         const documents = [
            "bases/bases",
            "bases/bases-risques",
            "bases/bases-bonnes-pratiques",
            "bases/bases-outils-utiles",
            "bases/bases-legislation",
            "bases/bases-glossaire",
            "ne-pas-etre-piege/ne-pas-etre-piege",
            "ne-pas-etre-piege/ne-pas-etre-piege-phishing",
            "ne-pas-etre-piege/ne-pas-etre-piege-ransomware",
            "ne-pas-etre-piege/ne-pas-etre-piege-fake-news",
            "ne-pas-etre-piege/ne-pas-etre-piege-escroqueries",
            "ne-pas-etre-piege/ne-pas-etre-piege-securiser-comptes",
            "teletravail-et-securite/teletravail-et-securite",
            "teletravail-et-securite/teletravail-connexion-internet",
            "teletravail-et-securite/teletravail-gestion-donnees",
            "teletravail-et-securite/teletravail-menaces-specifiques",
            "teletravail-et-securite/teletravail-securiser-poste-travail",
            "teletravail-et-securite/teletravail-vpn-acces-distance",
            "securite-locaux/securite-locaux",
            "securite-des-locaux/securite-locaux-controle-acces",
            "securite-des-locaux/securite-locaux-surveillance-video",
            "securite-des-locaux/securite-locaux-zones-sensibles",
            "securite-des-locaux/securite-locaux-protection-intrusion",
            "securite-des-locaux/securite-locaux-gestion-incidents"
         ];

         // 2) Repère et stocke tes éléments
         const contentEl = document.getElementById('content');
         const prevBtn = document.getElementById('prevBtn');
         const nextBtn = document.getElementById('nextBtn');
         const sidebarLinks = document.querySelectorAll('#sidebar-menu a[data-doc]');

         // 3) Récupère ou initialise currentDoc
         let currentDoc = localStorage.getItem('currentDoc');
         if (!currentDoc || documents.indexOf(currentDoc) === -1) {
            currentDoc = 'bases/bases-bonnes-pratiques';
         }

         // 4) Charge et affiche un document
         function loadDoc(doc) {
            fetch(`/docs/${doc}.html`)
               .then(r => r.ok ? r.text() : Promise.reject())
               .then(html => {
                  contentEl.innerHTML = html;
                  currentDoc = doc;
                  localStorage.setItem('currentDoc', doc);
                  updateButtons();
                  updateSidebar();
               })
               .catch(() => {
                  contentEl.innerHTML = `<p>Document introuvable : ${doc}</p>`;
               });
         }

         // 5) Active/désactive Prev & Next
         function updateButtons() {
            const idx = documents.indexOf(currentDoc);
            prevBtn.disabled = idx <= 0;
            nextBtn.disabled = idx >= documents.length - 1;
         }

         function updateSidebar() {
            // 1) Récupère tous les parents et tous les liens
            const parentItems = document.querySelectorAll('#sidebar-menu li.parent');
            const links = document.querySelectorAll('#sidebar-menu a[data-doc]');

            // 2) Ferme tous les sous-menus et retire les classes active
            parentItems.forEach(parentLi => {
               parentLi.classList.remove('active');
               const subUl = parentLi.querySelector('ul');
               if (subUl) subUl.style.display = 'none';
            });
            links.forEach(link => link.classList.remove('active'));

            // 3) Trouve le lien actif correspondant à currentDoc
            const selector = `#sidebar-menu a[data-doc="${currentDoc}"]`;
            const activeLink = document.querySelector(selector);
            if (!activeLink) return;  // si currentDoc n'existe pas dans la sidebar, rien à faire

            // 4) Marque le lien et son parent
            activeLink.classList.add('active');
            const parentLi = activeLink.closest('li.parent');
            if (parentLi) {
               parentLi.classList.add('active');
               const subUl = parentLi.querySelector('ul');
               if (subUl) subUl.style.display = 'block';
            }
         }


         // 7) Événements Prev / Next
         prevBtn.addEventListener('click', () => {
            const idx = documents.indexOf(currentDoc);
            if (idx > 0) loadDoc(documents[idx - 1]);
         });
         nextBtn.addEventListener('click', () => {
            const idx = documents.indexOf(currentDoc);
            if (idx < documents.length - 1) loadDoc(documents[idx + 1]);
         });

         // 8) Événements clic dans la sidebar
         sidebarLinks.forEach(link => {
            link.addEventListener('click', e => {
               e.preventDefault();
               loadDoc(link.dataset.doc);
            });
         });

         // 9) Initialisation au chargement
         loadDoc(currentDoc);
      });
