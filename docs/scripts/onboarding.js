/**
 * Crée le onboarding (tutoriel initial)
 */
export function initialize() {
    const nextText = 'Suivant'
    const backText = 'Précédent'
    const cancelText = 'Quitter'
    const finishText = 'Explorer'

    let text

    const tour = new Shepherd.Tour({
        defaultStepOptions: {
          scrollTo: false
        },
        useModalOverlay: true
      })

    text = "<p style='color:#158a3f'> Bienvenue sur Explore Spotify Charts </p>"
    text += "Cet outils vous permet de visualiser les données du top-200 quotidien de Spotify de début janvier 2017 à début avril 2020, et ce pour 51 régions du monde (50 pays et le top mondial)."
    tour.addStep({
        text: text,
        buttons: [
            {
              action: function() {
                return this.cancel();
              },
              classes: 'shepherd-button-third',
              text: cancelText,
            },
            {
              action() {
                return this.next();
              },
              text: nextText
            }
          ],
      })

    text = "<p style='color:#158a3f'> Menu </p>"
    text += "À partir de ce menu, vous pouvez choisir votre angle d'exploration : sélectionner un <span style='color:#158a3f'> pays</span>, un <span style='color:#158a3f'> artiste</span>, un <span style='color:#158a3f'> titre</span> ou bien une période de l'année afin de comparer les <span style='color:#158a3f'> tendances</span>."
    tour.addStep({
        text: text,
        attachTo: {
          element: '#menuList',
          on: 'left'
        },
        buttons: [
            {
              action: function() {
                return this.cancel();
              },
              classes: 'shepherd-button-third',
              text: cancelText,
            },
            {
              action() {
                return this.back();
              },
              classes: 'shepherd-button-secondary',
              text: backText
            },
            {
              action() {
                return this.next();
              },
              text: nextText
            }
          ],
      })


    text = "<p style='color:#158a3f'> Paramètres </p>"
    text += "C'est ici que vous allez pouvoir sélectionner les paramètres pour générer une visualisation. <br> <br> Par exemple, pour Explorer Par Pays, il vous faut sélectionner un <span style='color:#158a3f'> pays</span> et une <span style='color:#158a3f'> période de temps</span>. Vous pouvez également choisir de grouper les données par <span style='color:#158a3f'> titre</span> ou par <span style='color:#158a3f'> artiste</span>."
      tour.addStep({
        text: text,
        attachTo: {
          element: '#form',
          on: 'bottom'
        },
        buttons: [
            {
              action: function() {
                return this.cancel();
              },
              classes: 'shepherd-button-third',
              text: cancelText,
            },
            {
              action() {
                return this.back();
              },
              classes: 'shepherd-button-secondary',
              text: backText
            },
            {
              action() {
                return this.next();
              },
              text: nextText
            }
          ],
      })

      text = "<p style='color:#158a3f'> Actualiser </p>"
      text += "Une fois les paramètres sélectionnés, il suffit de cliquer sur ce bouton pour générer la visualisation."
      tour.addStep({
        text: text,
        attachTo: {
          element: '#submit',
          on: 'bottom'
        },
        buttons: [
            {
              action: function() {
                return this.cancel();
              },
              classes: 'shepherd-button-third',
              text: cancelText,
            },
            {
              action() {
                return this.back();
              },
              classes: 'shepherd-button-secondary',
              text: backText
            },
            {
              action() {
                return this.next();
              },
              text: nextText
            }
          ],
      })

      text = "<p style='color:#158a3f'> Visualisation </p>"
      text += "C'est ici qu'apparaîtra la visualisation générée."
      tour.addStep({
        text: text,
        attachTo: {
          element: '#main-g',
          on: 'top'
        },
        buttons: [
            {
              action: function() {
                return this.cancel();
              },
              classes: 'shepherd-button-third',
              text: cancelText,
            },
            {
              action() {
                return this.back();
              },
              classes: 'shepherd-button-secondary',
              text: backText
            },
            {
              action() {
                return this.next();
              },
              text: nextText
            }
          ],
      })

      text = "<p style='color:#158a3f'> Fin du tutoriel </p>"
      text += "Vous en savez maintenant assez pour commencer votre exploration !"
      tour.addStep({
        text: text,
        buttons: [
            {
              action() {
                return this.back();
              },
              classes: 'shepherd-button-secondary',
              text: backText
            },
            {
              action() {
                return this.next();
              },
              text: finishText
            }
          ],
      })
    
    tour.start()
}