
import data from './src/assets/data.json'

const urls = data.menu.map(item => item.url);

export default {
  ssr: false,
  async prerender() {
    return ["/", ...urls];
  },
}
