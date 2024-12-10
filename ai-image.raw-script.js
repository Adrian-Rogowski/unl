/* eslint-disable no-undef */
const tempImage = [];
const tempApiResponse = {};
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

const productImageList = `<div id="aiImagesList"  style="display:grid; grid-template-columns: 1fr 1fr 1fr; overflow:hidden; gap:8px"></div>`;
unlayer.registerPropertyEditor({
  name: "product_image_library",
  layout: "bottom",
  Widget: unlayer.createWidget({
    render() {
      return productImageList;
    },
    mount(node, value, updateValue) {
      const container = document.querySelector("#aiImagesList");
      if (value.length === 0) {
        container.innerHTML = `
        <div style="text-align:center;">
          <p style="margin:0;color:#050505;font-size:16px;font-weight:500">Making your image beautiful… ✨</p>
        </div>
        `;
        container.style.display = "flex";
        container.style.justifyContent = "center";
        container.style.alignItems = "center";
      } else {
        container.innerHTML = "";
        container.style.display = "grid";
        container.style.gridTemplateColumns = "1fr 1fr 1fr";
        value.forEach((img) => {
          const imgNode = document.createElement("img");
          imgNode.src = img;
          imgNode.style.width = "100%";
          imgNode.style.height = "auto";
          imgNode.style.borderRadius = "4px";
          imgNode.style.border = "1px solid #E5E5E5";
          imgNode.onclick = function () {
            updateValue({ url: img, data: value });
          };
          container.appendChild(imgNode);
        });
        tempImage.forEach((img) => {
          if (value.includes(img)) {
            updateSelectedImage(img);
          }
        });
      }

      window.addEventListener("message", handleMessage);

      function handleMessage(event) {
        if (event.data.source !== "edrone") return;
        if (event.data.tool !== "aiImage") return;
        if (event.data.method === "regenerateImage") {
          tempApiResponse[event.data.id] = event.data.images;
          if (value.length === 0) {
            updateValue({
              url: event.data.indexSelectedImage
                ? event.data.images[event.data.indexSelectedImage]
                : event.data.images[1],
              baseImages: event.data.baseImages,
              data: event.data.images,
              headline: event.data.headline,
              subHeadline: event.data.subHeadline,
              id: event.data.id,
              indexSelectedImage: event.data.indexSelectedImage,
            });
          }
        }
      }
    },
  }),
});

function updateSelectedImage(selectedImage) {
  const container = document.querySelector("#aiImagesList");
  if (!container) return;
  const images = container.querySelectorAll("img");
  images.forEach((img) => {
    if (img.src === selectedImage) {
      img.style.border = "4px solid #006CFA";
    } else {
      img.style.border = "1px solid #E5E5E5";
    }
  });
}

unlayer.registerPropertyEditor({
  name: "headlines",
  Widget: unlayer.createWidget({
    render() {
      return `
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <div style="width:50%;">
          <p style="color:#050505;font-size: 16px;font-weight: 400;margin:0">Heading</p>
          <input id="headline" maxlength="17" style="min-height: 40px;border:0;border-radius: 4px;background:#F2F2F2;padding: 4px 4px 4px 12px;width: 100%;" placeholder="Headline text" />
        </div>
        <div style="width:50%;">
          <p style="color:#050505;font-size: 16px;font-weight: 400;margin:0">Subheading</p>
          <input id="subHeadline" maxlength="23" style="min-height: 40px;border:0;border-radius: 4px;background:#F2F2F2;padding: 4px 4px 4px 12px;width: 100%;" placeholder="Sub-headline text"/>
        </div>
      </div>
      
      <button id="regenerateImage" style="width:100%;padding: 8px 16px;border-radius: 4px;border: 1px solid #E5E5E5;background: #FFF;">
      Change text
      </button>
      `;
    },
    mount(node, value, updateValue) {
      const [headline, subHeadline] = node.querySelectorAll("input");
      const button = node.querySelector("#regenerateImage");

      headline.value = value.headline || "";
      subHeadline.value = value.subHeadline || "";
      headline.oninput = function () {
        updateValue({ headline: headline.value, subHeadline: subHeadline.value });
      };
      subHeadline.oninput = function () {
        updateValue({ headline: headline.value, subHeadline: subHeadline.value });
      };

      button.onclick = function () {
        button.disabled = true;
        headline.disabled = true;
        subHeadline.disabled = true;
        updateValue({
          headline: headline.value,
          subHeadline: subHeadline.value,
          method: "regenerateImage",
          force: Math.random(), // is needed to force the update
        });
      };
    },
  }),
});
