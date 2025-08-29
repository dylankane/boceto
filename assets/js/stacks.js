document.addEventListener('DOMContentLoaded', () => {
    const mediaQuery = window.matchMedia('(max-width: 849px)');
    let activeStack = null;
    let carouselInterval = null;

    // Function to find the stack closest to the vertical center of the viewport
    function getCenterMostStack() {
        const stacks = Array.from(document.querySelectorAll('.media-stack'));
        if (stacks.length === 0) return null;

        const viewportCenterY = window.innerHeight / 2;

        return stacks.reduce((closest, stack) => {
            const rect = stack.getBoundingClientRect();
            const stackCenterY = rect.top + rect.height / 2;
            const distance = Math.abs(viewportCenterY - stackCenterY);

            if (distance < closest.distance) {
                return { distance, stack };
            }
            return closest;
        }, { distance: Infinity, stack: null }).stack;
    }

    // Function to start the carousel on the active stack
    function startCarousel(stack) {
        if (carouselInterval) clearInterval(carouselInterval);
        const items = stack.querySelectorAll('.stack-item');
        if (items.length === 0) return;

        let currentIndex = 0;

        const cycle = () => {
            items.forEach((item) => {
                item.classList.remove('is-cycling-top');
            });

            const currentItem = items[currentIndex];
            currentItem.classList.add('is-cycling-top');
            
            currentIndex = (currentIndex + 1) % items.length;
        };

        cycle(); // Initial cycle
        carouselInterval = setInterval(cycle, 3000);
    }

    // Function to stop the carousel and pin an item
    function stopCarouselAndPin(item) {
        const stack = item.closest('.media-stack');
        if (!stack.classList.contains('active-stack')) return;

        // If carousel is running, stop it. Otherwise, just swap the pinned item.
        if (carouselInterval) {
            clearInterval(carouselInterval);
            carouselInterval = null;
        }

        // Un-pin any currently pinned item in the stack
        const currentlyPinned = stack.querySelector('.is-pinned-top');
        if (currentlyPinned) {
            currentlyPinned.classList.remove('is-pinned-top');
        }

        // Remove cycling class from all items
        stack.querySelectorAll('.is-cycling-top').forEach(i => i.classList.remove('is-cycling-top'));

        // Pin the new item
        item.classList.add('is-pinned-top');
    }

    // Main logic handler to manage which stack is active
    function handleActiveStack() {
        const centerStack = getCenterMostStack();
        const allStacks = document.querySelectorAll('.media-stack');

        allStacks.forEach(stack => {
            if (stack === centerStack) {
                if (!stack.classList.contains('active-stack')) {
                    // This is the new active stack
                    stack.classList.remove('inactive-stack');
                    stack.classList.add('active-stack');
                    activeStack = stack;
                    startCarousel(activeStack);
                }
            } else {
                // This is not the active stack
                if (stack.classList.contains('active-stack')) {
                    // Deactivate it
                    clearInterval(carouselInterval);
                    carouselInterval = null;
                    stack.classList.remove('active-stack');
                    stack.querySelectorAll('.stack-item').forEach(item => {
                        item.classList.remove('is-cycling-top', 'is-pinned-top');
                    });
                }
                stack.classList.add('inactive-stack');
            }
        });

        if (!centerStack) {
            activeStack = null;
        }
    }

    // Setup for mobile view
    function setupMobile() {
        document.querySelectorAll('.stack-item').forEach(item => {
            item.addEventListener('click', () => stopCarouselAndPin(item));
        });
        
        handleActiveStack(); // Initial check
        window.addEventListener('scroll', handleActiveStack, { passive: true });
    }

    // Teardown for desktop view
    function teardownMobile() {
        window.removeEventListener('scroll', handleActiveStack);
        if (carouselInterval) clearInterval(carouselInterval);
        
        document.querySelectorAll('.media-stack').forEach(stack => {
            stack.classList.remove('active-stack', 'inactive-stack');
            stack.querySelectorAll('.stack-item').forEach(item => {
                item.classList.remove('is-cycling-top', 'is-pinned-top');
            });
        });
        activeStack = null;
    }

    // Media query listener
    function onMediaQueryChange(e) {
        if (e.matches) {
            setupMobile();
        } else {
            teardownMobile();
        }
    }

    mediaQuery.addEventListener('change', onMediaQueryChange);
    onMediaQueryChange(mediaQuery); // Initial check on page load
});