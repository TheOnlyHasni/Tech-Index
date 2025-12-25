(function () {
    function addCopyButtons() {
        const highlights = document.querySelectorAll('.highlight');

        highlights.forEach(highlight => {
            // Avoid adding multiple buttons
            if (highlight.querySelector('.copy-code-button')) return;

            const button = document.createElement('button');
            button.className = 'copy-code-button';
            button.type = 'button';
            button.innerText = 'Copy';

            button.addEventListener('click', () => {
                const codeblocks = highlight.querySelectorAll('code');
                const lastCodeblock = codeblocks[codeblocks.length - 1];
                const code = lastCodeblock.innerText;

                navigator.clipboard.writeText(code).then(() => {
                    button.innerText = 'Copied!';
                    button.classList.add('copied');

                    setTimeout(() => {
                        button.innerText = 'Copy';
                        button.classList.remove('copied');
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy code: ', err);
                    button.innerText = 'Error';
                });
            });

            highlight.appendChild(button);
        });
    }

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addCopyButtons);
    } else {
        addCopyButtons();
    }
})();
