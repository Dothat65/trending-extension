// trending-app/src/content.js
// (This file will be built by Vite into trending-app/dist/content.js)

// @ts-ignore
/*
    Monitors DOM changes on Google Maps to detect when a restaurant
    detail panel becomes visible, extracts restaurant name and address,
    and stores them in chrome.storage.local.
*/

// Test that content script is loaded
console.log('Restaurant Recs Content Script Loaded!');

// Create a visual indicator
const indicator = document.createElement('div');
indicator.style.position = 'fixed';
indicator.style.top = '10px';
indicator.style.right = '10px';
indicator.style.padding = '10px';
indicator.style.background = 'green';
indicator.style.color = 'white';
indicator.style.zIndex = '9999';
indicator.style.borderRadius = '5px';
indicator.style.cursor = 'pointer';
indicator.textContent = 'Restaurant Recs Active';

// Add click handler to show status
indicator.addEventListener('click', () => {
    console.log('Extension Status:', {
        'Script Loaded': true,
        'Observer Active': !!window._restaurantRecsObserver,
        'Target Found': !!document.querySelector('.XltNde'),
        'Chrome API Available': !!window.chrome?.storage
    });
});

document.body.appendChild(indicator);

// @ts-ignore
/*
    will print log if it notices the specific item.
*/
const handle_change = (mutationsList, observer) => {
    console.log('MutationObserver triggered - Number of mutations:', mutationsList.length);
    for (let i = 0; i < mutationsList.length; i++) {
        let mutation = mutationsList[i]
        console.log(mutation.type, mutation.target)
        if ((mutation.type === 'attributes' && mutation.attributeName === 'style') || mutation.type == 'childList') {
            // Check if the element has the 'display' style property
            let node = mutation.target
            // Check if the mutated node has the class 'gYkzb'
            console.log('Found style change on element:', node.className);
            if (node.classList.contains('gYkzb') || node.classList.contains('aIFcqe')) {
                const displayStyle = window.getComputedStyle(node).display;
                console.log('Found gYkzb element, display style:', displayStyle);

                // If the display is not 'none', log the change
                if (displayStyle !== 'none' || node.classList.contains('aIFcqe')) {
                    const target = document.querySelector('.XltNde')
                    
                    try {
                        if (target && target.querySelector('.DkEaL') && target.querySelector('.DkEaL').innerHTML.toLowerCase().includes('restaurant')) {
                            const nameElement = target.querySelector('.a5H0ec');
                            const addressElement = target.querySelector('.Io6YTe.fontBodyMedium.kR99db.fdkmkc');
                            
                            if (nameElement && addressElement) {
                                let name = nameElement.innerHTML || document.querySelector('h1.DUwDvf.lfPIob')?.innerText.trim();
                                let address = addressElement.innerHTML;
                                console.log('Found restaurant:', { name, address });
                                indicator.style.background = 'blue';
                                indicator.textContent = `Found: ${name}`;
                                
                                chrome.storage.local.set({ name: name, address: address }).then(() => {
                                    console.log("Values updated in storage");
                                    indicator.style.background = 'green';
                                    setTimeout(() => {
                                        indicator.textContent = 'Restaurant Recs Active';
                                    }, 3000);
                                }).catch(err => {
                                    console.error('Storage error:', err);
                                    indicator.style.background = 'red';
                                });
                            } else {
                                console.log('Restaurant elements found but missing name or address');
                            }
                        } else {
                            console.log('Not a restaurant or missing required elements');
                        }
                    } catch (err) {
                        console.error('Error processing restaurant:', err);
                        indicator.style.background = 'red';
                    }
                }
            }
        }
    }
}

/*
    injection point for reading a change to the dom for the specific 
    class in the google maps side appearing
*/
const main = () => {
    const config = { attributes: true, childList: true, subtree: true };

    const observer = new MutationObserver(handle_change);
    const target = document.querySelector('.XltNde');

    if (target) {
        observer.observe(target, config);
        console.log('Observer started');
    } else {
        console.log('Target element not found, waiting for it to load...');
        // Wait for the element to be available
        const checkInterval = setInterval(() => {
            const target = document.querySelector('.XltNde');
            if (target) {
                observer.observe(target, config);
                console.log('Observer started after waiting');
                clearInterval(checkInterval);
            }
        }, 1000);
    }
}

// Execute main when the content script loads
main();
