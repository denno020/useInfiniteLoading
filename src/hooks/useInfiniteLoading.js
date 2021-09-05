/**
 * useInfiniteLoading
 *
 * @author Luke Denton <luke@iamlukedenton.com>
 * @license MIT
 */
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useInView from 'react-cool-inview';

const clientCanPreload = !['slow-2g', '2g'].includes(navigator.connection.effectiveType) && !navigator.connection.saveData;

/**
 * Handle infinite loading a list of items
 * @param {Object}   props
 * @param {Function} props.getItems
 * @param {Object}   props.options
 * @param {'manual'|'partial'|'infinite'} props.options.loadingType Indicate the method of infinite loading. 'manual' = user must trigger using button. 'partial' = there is a finite number of auto loads before user has to manually press button (set using 'partialInfiniteLimit'). 'infinite' = continue to auto load new pages for as long as there are new pages available
 * @param {'off'|'safe'|'always'} [props.options.preload] 'safe' = only preload when client can handle. Default 'off'
 * @param {number} [props.options.partialInfiniteLimit] Indicate the max number of times to auto load. Default -1, which means don't limit
 *
 * @returns {{loadPrevious: loadPrevious, loadNext: loadNext, hasPrevious: boolean, hasNext: boolean, items: *[], loadMoreRef: (element?: (HTMLElement | null)) => void}}
 */
export const useInfiniteLoading = (props) => {
  const { getItems, options = {} } = props;
  const { loadingType, preload = 'off', partialInfiniteLimit = -1 } = options;
  const [items, setItems] = useState([]);
  const nextItems = useRef([]);
  const allPagesLoaded = useRef(false);
  const initialPage = useRef(Number(new URLSearchParams(window.location.search).get('page')) || 1);
  const initialPageLoaded = useRef(false);
  const [hasNext, setHasNext] = useState(true);
  const [hasPrevious, setHasPrevious] = useState(() => initialPage.current !== 1);
  const lowestPageLoaded = useRef(initialPage.current);
  const highestPageLoaded = useRef(initialPage.current);
  const isInFlight = useRef(false);
  const triggerNext = useRef(false);
  const remainingPagesToAutoload = useRef(loadingType === 'manual' ? 0 : partialInfiniteLimit);
  const history = useHistory();

  if (partialInfiniteLimit >= 0 && loadingType !== 'partial') {
    console.warn('Option "partialInfiniteLimit" provided by loading type not "partial". "partialInfiniteLimit" will be ignored');
  }

  if (loadingType === 'partial' && partialInfiniteLimit < 0) {
    throw new Error('When using loadingType "partial", must also provide a positive value for "partialInfiniteLimit"');
  }

  const canPreload = (() => {
    if (preload === 'always') {
      return true;
    }

    if (preload === 'safe' && clientCanPreload) {
      return true;
    }

    return false;
  })()

  const loadItems = async (page, itemCombineMethod) => {
    let items;
    if (itemCombineMethod === 'prepend' || !nextItems.current.length || canPreload === false) {
      isInFlight.current = true;
      const data = await getItems({ page });
      isInFlight.current = false;
      items = data.items;
      setHasPrevious(lowestPageLoaded.current > 1);

      // Handle loading the last page directly
      if (itemCombineMethod === 'append' && data.totalPages <= page) {
        setHasNext(false);
        allPagesLoaded.current = true;
      }
    } else {
      items = nextItems.current;
    }

    setItems(prevItems => {
      return itemCombineMethod === 'prepend' ?
        [...items, ...prevItems] :
        [...prevItems, ...items]
    });

    if (itemCombineMethod === 'prepend' || canPreload === false) return;

    nextItems.current = [];

    if (!allPagesLoaded.current) {
      isInFlight.current = true;
      const data = await getItems({ page: page + 1 })
      isInFlight.current = false;
      allPagesLoaded.current = data.totalPages <= page + 1;
      nextItems.current = data.items;

      if (triggerNext.current) {
        triggerNext.current = false;
        loadNext();
      }
    } else {
      setHasNext(false);
    }
  };

  const loadNext = () => {
    const nextPage = highestPageLoaded.current + 1;
    history.replace(`?page=${nextPage}`);
    loadItems(nextPage, 'append');
    highestPageLoaded.current = nextPage;
  }

  const loadPrevious = () => {
    const nextPage = lowestPageLoaded.current - 1;
    history.replace(`?page=${nextPage}`);
    loadItems(nextPage, 'prepend');
    lowestPageLoaded.current = nextPage;
  }

  useEffect(() => {
    if (initialPageLoaded.current) {
      return;
    }

    loadItems(initialPage.current, 'append');
    initialPageLoaded.current = true;
  }, [loadItems])

  const { observe, unobserve } = useInView({
    onEnter: () => {
      if (remainingPagesToAutoload.current === 0) {
        unobserve();
        return;
      }

      remainingPagesToAutoload.current = remainingPagesToAutoload.current - 1
      if (isInFlight.current) {
        triggerNext.current = true;
      } else {
        loadNext();
      }
    },
  });

  return {
    items,
    hasNext,
    hasPrevious,
    loadNext,
    loadPrevious,
    loadMoreRef: observe
  };
}
