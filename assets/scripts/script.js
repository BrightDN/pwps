function getDocDef(balloonIMG, pageSize, productBrand, productNaming, productSpecs, promotionBig, promotionBig2, promotionSmall, layout) {
    return {
    pageSize: pageSize,
    pageOrientation: 'landscape',
    background: function (currentPage, pageSize) {
    return {
      canvas: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          w: pageSize.width,
          h: pageSize.height,
          color: '#ffde00' 
        }
      ]
    };
  },
  content: [
    {
      columns: [
        {
          width: '*',
          stack: [
            {
              text: productBrand,
              fontSize: layout[pageSize].brandFontSize,
              bold: true,
              margin: [0, 0, 0, 0]
            },
            {
              text: productNaming,
              margin: [0, 0, 0, 0],
              bold: true,
              fontSize: layout[pageSize].productFontSize
            },
            {
              text: productSpecs,
              fontSize:layout[pageSize].specsFontSize,
            }
          ]
        },

        // // Right column
{
  stack: [
    {
      image: balloonIMG,
      width: layout[pageSize].imageWidth
    },
    {
      stack: [
        promotionBig ? { text: promotionBig, fontSize: layout[pageSize].promoMainTextSize, bold: true, alignment: 'center', color: '#fff' } : null,
        promotionBig2 ? { text: promotionBig2, fontSize: layout[pageSize].promoMainTextSize, bold: true, alignment: 'center', color: '#fff' } : null,
        promotionSmall ? { text: promotionSmall, fontSize: layout[pageSize].promoSubTextSize, bold: true, alignment: 'center', color: '#fff' } : null
      ].filter(Boolean),
absolutePosition: {
  x: layout[pageSize].imageWidth * layout[pageSize].textOffsetX,
  y: layout[pageSize].imageWidth * layout[pageSize].textOffsetY
},
      width: layout[pageSize].imageWidth * 0.7
    }
  ]
}
      ],
      columnGap: 30
    }
  ],

  footer: function(currentPage) {
    return {
      margin: [0, 0, 0, 0],
      table: {
        widths: ['*', 'auto'],
        body: [[
          {
            text: getPromotionWeek(),
            alignment: 'left',
            color: 'white',
            margin: [10, 6, 0, 6]
          },
          {
            text: `Aanbieding voorbehouden voor SuperPluskaarthouders`,
            alignment: 'right',
            color: 'white',
            fontSize: '8',
            margin: [0, 6, 10, 6]
          }
        ]]
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        fillColor: () => '#D32F2F'
      }
    };
  },
}
}

async function loadImage(url) {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

// PROMOTION WEEK GRABBER

function getPromotionWeek(){
    const today = new Date();
    const start=getPromotionThursday(today);
    const end=new Date(start);
    end.setDate(end.getDate()+6);
    return `${formatDate(start)} - ${formatDate(end)}`
}

function getPromotionThursday(d) {
    const weekday = d.getDay();
    const diff = (weekday - 4 + 7) % 7;

    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);

    return d;
}

function formatDate(date){
    const dd=String(date.getDate()).padStart(2,"0");
    const mm=String(date.getMonth()+1).padStart(2,"0");
    const yy=String(date.getFullYear()).slice(-2);
    return `${dd}.${mm}.${yy}`;
}

// END OF PROMOTION WEEK GRABBER

document.addEventListener("change", render)

async function render() {

    // Grabbing data from page
    const balloonImage = await loadImage('/assets/superballoon.png');
    const pageSize = document.querySelector('select[name="formaat"]').value
    const productBrand = document.querySelector('input[name="merk"]').value.toUpperCase()
    const productNaming = document.querySelector('input[name="product"]').value
    const productSpecs = document.querySelector('input[name="specificatie"]').value
    const promotionBig = document.querySelector('input[name="promotietekst_groot"]').value.toUpperCase()
    const promotionBig2 = document.querySelector('input[name="promotietekst_groot2"]').value.toUpperCase()
    const promotionSmall = document.querySelector('input[name="promotietekst_klein"]').value

    const docDefinition = getDocDef(balloonImage, pageSize, productBrand, productNaming, productSpecs, promotionBig, promotionBig2, promotionSmall, getLayout(pageSize))
    pdfMake.createPdf(docDefinition).getDataUrl().then((dataUrl) => {
        const targetElement = document.querySelector('.iFrameContainer');
        targetElement.innerHTML = ""
        const iframe = document.createElement('iframe');
        iframe.src = dataUrl;
        targetElement.appendChild(iframe);
    }, err => {
        console.error(err);
    });
}


// TEMPORAL TESTING

function getLayout(pageSize) {
    return {
        A5: 
            {
                imageWidth: 220,
                brandFontSize: 45,
                productFontSize: 30,
                specsFontSize: 15,
                promoMainTextSize: 36,
                promoSubTextSize: 18,
                textOffsetX: 1.43,
                textOffsetY: 0.35
            },
        A4: 
            {
                imageWidth: 300,
                brandFontSize: 60,
                productFontSize: 36,
                specsFontSize: 21,
                promoMainTextSize: 45,
                promoSubTextSize: 30,
                textOffsetX: 1.35,
                textOffsetY: 0.35
            },
        A3: 
            {
                imageWidth: 500,
                brandFontSize: 90,
                productFontSize: 60,
                specsFontSize: 30,
                promoMainTextSize: 90,
                promoSubTextSize: 30,
                textOffsetX: 1.30,
                textOffsetY: 0.20
            },
    };
}