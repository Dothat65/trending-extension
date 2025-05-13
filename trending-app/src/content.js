// @ts-ignore
/*
    will print log if it notices the specific item.
*/
const handle_change = (mutationsList, observer) => {
    for (let i = 0; i < mutationsList.length; i++) {
        let mutation = mutationsList[i]

        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            // Check if the element has the 'display' style property
            let node = mutation.target
            // Check if the mutated node has the class 'gYkzb'
            //console.log(node.classList)
            if (node.classList.contains('gYkzb')) {
                const displayStyle = window.getComputedStyle(node).display;

                // If the display is not 'none', log the change
                if (displayStyle !== 'none') {
                    const target = document.querySelector('.XltNde')

                    if (target.querySelector('.DkEaL').innerHTML.includes('restaurant')) {
                        let name = target.querySelector('.a5H0ec').innerHTML;
                        let address = target.querySelector('.Io6YTe.fontBodyMedium.kR99db.fdkmkc').innerHTML;
                        console.log(name, address)
                        chrome.storage.local.set({ name: name, address : address }).then(() => {
                            console.log("Values updated");
                        });
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
// const main = () => {
//     const config = { attributes: true, childList: true, subtree: true };

//     const observer = new MutationObserver(handle_change)
//     const target = document.querySelector('.XltNde');

//     observer.observe(target, config)
// }
