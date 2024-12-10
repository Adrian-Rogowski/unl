unlayer.registerTool({
  name: "ai_image_tool",
  label: "Banner",
  icon: "https://d3vhsxl1pwzf0p.cloudfront.net/ai_image/banner.svg",
  supportedDisplayModes: ["web", "email"],
  options: {
    productContent: {
      title: "Image Settings",
      position: 1,
      options: {
        productImage: {
          label: "Image",
          widget: "image",
          defaultValue: {
            url: "https://via.placeholder.com/150",
          },
        },
      },
    },
  },
  renderer: {
    Viewer: unlayer.createViewer({
      render(values) {
        return `
          <div style="text-align:center;">
            <img src="${values.productImage.url}" style="max-width: 100%;" />
          </div>
        `;
      },
    }),
  },
});
