unlayer.registerTool({
  name: "ai_image_tool",
  label: "Banner",
  icon: "https://d3vhsxl1pwzf0p.cloudfront.net/ai_image/banner.svg",
  supportedDisplayModes: ["web", "email"],
  position: 4,
  options: {
    productContent: {
      title: "Image",
      position: 1,
      options: {
        productImage: {
          label: "Image",
          defaultValue: {
            url: "https://d3vhsxl1pwzf0p.cloudfront.net/ai_image/h_1_7.jpg",
          },
          widget: "image",
        },
        productImageAlignment: {
          label: "Alignment",
          defaultValue: "center",
          widget: "alignment",
        },
        productImageHeadlines: {
          label: "Headlines",
          widget: "headlines",
        },
        productImageLibrary: {
          label: "Select Image from Library",
          widget: "product_image_library",
          defaultValue: [],
        },
        productImageAction: {
          label: "Image Action",
          defaultValue: {
            name: "web",
            values: {
              href: "http://google.com",
              target: "_blank",
            },
          },
          widget: "link",
        },
      },
    },
  },
  values: {
    containerPadding: "0px",
    baseImages: [],
  },
  transformer: (values, source) => {
    const { name, value } = source;
    if (name === "productImage" || name === "src") {
      if (!values.productImageLibrary.includes(value.url)) {
        const parameters = {
          source: "edrone",
          tool: "aiImage",
          method: "uploadImage",
          value: {
            url: [value.url],
            id: values._meta.htmlID,
            images: values.productImageLibrary,
            headline: values.productImageHeadlines.headline,
            subHeadline: values.productImageHeadlines.subHeadline,
            firstUpload: values.productImage.url === "https://d3vhsxl1pwzf0p.cloudfront.net/ai_image/h_1_7.jpg",
          },
        };
        window.parent.postMessage(parameters, "*");

        setTimeout(() => {
          const headline = document.querySelector("#headline");
          const subHeadline = document.querySelector("#subHeadline");
          const button = document.querySelector("#regenerateImage");

          headline.disabled = true;
          subHeadline.disabled = true;
          button.disabled = true;
        }, 1000);

        return {
          ...values,
          productImageLibrary: [],
        };
      }
    }

    if (name === "productImageLibrary") {
      if (value.id === values._meta.htmlID) {
        const headline = document.querySelector("#headline");
        const subHeadline = document.querySelector("#subHeadline");
        const button = document.querySelector("#regenerateImage");

        if (headline && subHeadline && button) {
          headline.disabled = false;
          subHeadline.disabled = false;
          button.disabled = false;
        }

        tempImage.push(
          value.indexSelectedImage ? value.data[value.indexSelectedImage] : value.data[1] || value.data[0]
        );
        return {
          ...values,
          productImage: {
            url: value.indexSelectedImage ? value.data[value.indexSelectedImage] : value.data[1] || value.data[0],
          },
          productImageLibrary: value.data,
          productImageHeadlines: {
            headline: value.headline || values.productImageHeadlines.headline,
            subHeadline: value.subHeadline || values.productImageHeadlines.subHeadline,
          },
          baseImages: value.baseImages,
        };
      }
      if (value.id) {
        return {
          ...values,
          productImageLibrary: tempApiResponse[values._meta.htmlID] || values.productImageLibrary.data,
          productImage: values.productImage,
        };
      }
      updateSelectedImage(value.url);
      return {
        ...values,
        productImageLibrary: value.data,
        productImage: { url: value.url },
      };
    }

    if (name === "productImageHeadlines") {
      if (value.method === "regenerateImage") {
        const indexSelectedImage = values.productImageLibrary.indexOf(values.productImage.url);
        const parameters = {
          source: "edrone",
          tool: "aiImage",
          method: "regenerateImage",
          value: {
            headline: value.headline,
            subHeadline: value.subHeadline,
            images: values.productImageLibrary,
            baseImages:
              !!values.baseImages && values.baseImages.length > 0
                ? values.baseImages
                : !!values.context && values.context.length > 0
                ? values.context
                : [values.productImageLibrary[0]],
            url: values.productImageLibrary,
            id: values._meta.htmlID,
            indexSelectedImage,
          },
        };
        window.parent.postMessage(parameters, "*");

        return {
          ...values,
          productImageLibrary: [],
        };
      }
    }

    return values;
  },
  renderer: {
    Viewer: unlayer.createViewer({
      render(values) {
        const align = values.productImageAlignment || "center";
        if (values.productImageLibrary.length === 0) {
          return `
          <div style="display:flex;justify-content:${align}">
            <img style="display: block; max-width: ${values.productImage.maxWidth}; min-width: 100px; width: ${values.productImage.maxWidth}; filter: blur(8px)" src="${values.productImage.url}" >
              <div style="position: absolute;left: 50%;top: 50%;transform: translate(-50%, -50%);width: 90%;text-align: center;background: #ffffffd4;display: flex;flex-direction: column;justify-content: center;border-radius: 8px;padding: 8px;">
                <p style="margin:0;color:#050505;font-size:16px;font-weight:500">Making your image beautiful… ✨</p>
              </div>
            </img>
          </div>`;
        }

        return `
        <a style="display:flex;justify-content:${align}" href="${values.productImageAction.url}" target="${values.productImageAction.target}">
          <img style="display: block; max-width: ${values.productImage.maxWidth}; min-width: 100px; width: 100%;" src="${values.productImage.url}"  />
        </a>
        `;
      },
    }),
    exporters: {
      web: function (values) {
        const align = values.productImageAlignment || "center";
        return `<a style="display:flex;justify-content:${align}" href="${values.productImageAction.url}" target="${values.productImageAction.target}">
          <img style="display: block; max-width: ${values.productImage.maxWidth}; min-width: 100px; width: 100%;" src="${values.productImage.url}"  />
        </a>`;
      },
      email: function (values) {
        const align = values.productImageAlignment || "center";
        return `<a style="display:flex;justify-content:${align}" href="${values.productImageAction.url}" target="${values.productImageAction.target}">
          <img style="display: block; max-width: ${values.productImage.maxWidth}; min-width: 100px; width: 100%;" src="${values.productImage.url}"  />
        </a>`;
      },
    },
    head: {
      css: function () {},
      js: function (values) {
        tempImage.push(values.productImage.url);
      },
    },
  },
  validator() {
    return [];
  },
});
