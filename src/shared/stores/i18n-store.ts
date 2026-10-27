import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'es' | 'en';

export const dictionary = {
  es: {
    nav: {
      brand: 'BidHub',
      tagline: 'Subastas de Colección',
      home: 'Inicio',
      catalog: 'Catálogo',
      publish: 'Publicar Subasta',
      dashboard: 'Mi Panel',
      admin: 'Administración',
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      logout: 'Cerrar Sesión',
      welcome: 'Hola',
    },
    home: {
      heroTitle: 'El mercado definitivo de artículos de colección',
      heroSubtitle: 'Descubre, oferta y subasta cartas raras, relojes vintage, vinilos de primera edición y piezas únicas con total seguridad.',
      exploreBtn: 'Explorar Catálogo',
      publishBtn: 'Publicar Artículo',
      featuredTitle: 'Subastas Destacadas',
      categoriesTitle: 'Categorías Populares',
    },
    auctions: {
      title: 'Catálogo de Subastas',
      filterCategory: 'Categoría',
      filterStatus: 'Estado',
      allCategories: 'Todas las categorías',
      allStatuses: 'Todos los estados',
      active: 'Activas',
      closed: 'Cerradas',
      deserted: 'Desiertas',
      cancelled: 'Canceladas',
      currentPrice: 'Oferta actual',
      startingPrice: 'Precio inicial',
      minIncrement: 'Incremento mín.',
      bidsCount: 'ofertas',
      endsIn: 'Finaliza en',
      viewDetail: 'Ver Subasta',
      ended: 'Finalizada',
      winner: 'Ganador',
      noAuctions: 'No se encontraron subastas con los filtros seleccionados.',
    },
    detail: {
      seller: 'Vendedor',
      description: 'Descripción del lote',
      bidHistory: 'Historial de Ofertas',
      placeBidTitle: 'Realizar una Oferta',
      yourBid: 'Tu oferta (USD)',
      minBidNotice: 'Oferta mínima:',
      placeBidBtn: 'Confirmar Oferta',
      mustLoginToBid: 'Inicia sesión para ofertar en esta subasta.',
      cannotBidOwn: 'Eres el vendedor de esta subasta.',
      editAuction: 'Editar Subasta',
      cancelAuction: 'Cancelar Subasta',
      cancelAdmin: 'Moderar / Cancelar Subasta (Admin)',
      cancelReasonPlaceholder: 'Motivo obligatorio de cancelación por moderación...',
      confirmCancel: 'Confirmar Cancelación',
      antiSnipingNotice: 'Regla anti-sniping activa: Si se oferta faltando 5 minutos o menos, el cierre se extiende 5 minutos automáticamente.',
    },
    countdown: {
      days: 'd',
      hours: 'h',
      minutes: 'm',
      seconds: 's',
      ended: 'Subasta Finalizada',
      extendedNotice: '¡Tiempo extendido 5 minutos!',
    },
  },
  en: {
    nav: {
      brand: 'BidHub',
      tagline: 'Collectible Auctions',
      home: 'Home',
      catalog: 'Catalog',
      publish: 'Post Auction',
      dashboard: 'My Dashboard',
      admin: 'Admin Panel',
      login: 'Sign In',
      register: 'Register',
      logout: 'Sign Out',
      welcome: 'Hello',
    },
    home: {
      heroTitle: 'The Premier Marketplace for Rare Collectibles',
      heroSubtitle: 'Discover, bid, and auction rare trading cards, vintage timepieces, first-press vinyl records, and one-of-a-kind treasures with confidence.',
      exploreBtn: 'Explore Catalog',
      publishBtn: 'Sell an Item',
      featuredTitle: 'Featured Auctions',
      categoriesTitle: 'Popular Categories',
    },
    auctions: {
      title: 'Auction Catalog',
      filterCategory: 'Category',
      filterStatus: 'Status',
      allCategories: 'All categories',
      allStatuses: 'All statuses',
      active: 'Active',
      closed: 'Closed',
      deserted: 'Deserted',
      cancelled: 'Cancelled',
      currentPrice: 'Current bid',
      startingPrice: 'Starting price',
      minIncrement: 'Min. increment',
      bidsCount: 'bids',
      endsIn: 'Ends in',
      viewDetail: 'View Auction',
      ended: 'Finished',
      winner: 'Winner',
      noAuctions: 'No auctions found matching current filters.',
    },
    detail: {
      seller: 'Seller',
      description: 'Lot Description',
      bidHistory: 'Bid History',
      placeBidTitle: 'Place a Bid',
      yourBid: 'Your bid (USD)',
      minBidNotice: 'Minimum bid:',
      placeBidBtn: 'Place Bid',
      mustLoginToBid: 'Sign in to bid on this auction.',
      cannotBidOwn: 'You are the seller of this auction.',
      editAuction: 'Edit Auction',
      cancelAuction: 'Cancel Auction',
      cancelAdmin: 'Moderate / Cancel Auction (Admin)',
      cancelReasonPlaceholder: 'Mandatory reason for admin cancellation...',
      confirmCancel: 'Confirm Cancellation',
      antiSnipingNotice: 'Anti-sniping rule active: Bids placed within the last 5 minutes automatically extend closing time by 5 minutes.',
    },
    countdown: {
      days: 'd',
      hours: 'h',
      minutes: 'm',
      seconds: 's',
      ended: 'Auction Closed',
      extendedNotice: 'Time extended by 5 minutes!',
    },
  },
};

export interface I18nStore {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof dictionary['es'];
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set, get) => ({
      lang: 'es',
      setLang: (lang: Language) => set({ lang, t: dictionary[lang] }),
      t: dictionary['es'],
    }),
    {
      name: 'bidhub-i18n-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = dictionary[state.lang || 'es'];
        }
      },
    }
  )
);
