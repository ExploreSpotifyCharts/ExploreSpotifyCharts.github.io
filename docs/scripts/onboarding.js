export function initialize() {
    const nextText = 'Suivant'
    const backText = 'Précédent'
    const finishText = 'Explorer'

    const tour = new Shepherd.Tour({
        defaultStepOptions: {
          scrollTo: false
        },
        useModalOverlay: true
      })

    tour.addStep({
        text: "<p style='color:#158a3f'> Bienvenue </p> Blablabla.",
        buttons: [
            {
              action() {
                return this.next();
              },
              text: nextText
            }
          ],
      })

    tour.addStep({
        text: "<p style='color:#158a3f'> Menu </p> Joli menu t'as vu.",
        attachTo: {
          element: '#menuList',
          on: 'left'
        },
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
              text: nextText
            }
          ],
      })

      tour.addStep({
        text: "<p style='color:#158a3f'> Paramètres </p> Là tu peux gérer les paramètres, c'est vachement bien fait.",
        attachTo: {
          element: '#form',
          on: 'bottom'
        },
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
              text: nextText
            }
          ],
      })

      tour.addStep({
        text: "<p style='color:#158a3f'> Submit </p> Là tu cliques pour générer la viz",
        attachTo: {
          element: '#submit',
          on: 'bottom'
        },
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
              text: nextText
            }
          ],
      })

      tour.addStep({
        text: "<p style='color:#158a3f'> Viz </p> Là tu verras la viz, elle est belle hein ?",
        attachTo: {
          element: '#main-g',
          on: 'top'
        },
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
              text: nextText
            }
          ],
      })

      tour.addStep({
        text: "<p style='color:#158a3f'> Fin du tuto </p> Allez, vas explorer maintenant.",
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