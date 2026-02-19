/**
 * Interactive Collapsible Table of Contents
 * Handles individual heading toggles and a global "Toggle All" state.
 */
document.addEventListener('DOMContentLoaded', () => {
    const toc = document.querySelector('.toc .inner');
    if (!toc) return;

    // 1. Add Toggle All Button if not present
    let toggleAllBtn = document.querySelector('.toc-toggle-all');
    if (!toggleAllBtn) {
        toggleAllBtn = document.createElement('button');
        toggleAllBtn.className = 'toc-toggle-all';
        toggleAllBtn.innerHTML = 'Collapse All';
        toc.prepend(toggleAllBtn);
    }

    // 2. Identify and setup collapsible items
    const items = toc.querySelectorAll('li');
    items.forEach(item => {
        const subList = item.querySelector('ul');
        if (subList) {
            item.classList.add('has-subsections');
            
            // Create toggle arrow
            const toggle = document.createElement('span');
            toggle.className = 'toc-toggle-icon';
            toggle.innerHTML = '▾';
            
            const link = item.querySelector('a');
            item.insertBefore(toggle, link);

            // Click listener for toggle
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isCollapsed = item.classList.toggle('sections-collapsed');
                toggle.innerHTML = isCollapsed ? '▸' : '▾';
            });
        }
    });

    // 3. Toggle All Logic
    let allExpanded = true;
    toggleAllBtn.addEventListener('click', () => {
        allExpanded = !allExpanded;
        const parentItems = toc.querySelectorAll('.has-subsections');
        
        parentItems.forEach(item => {
            const toggle = item.querySelector('.toc-toggle-icon');
            if (allExpanded) {
                item.classList.remove('sections-collapsed');
                if (toggle) toggle.innerHTML = '▾';
            } else {
                item.classList.add('sections-collapsed');
                if (toggle) toggle.innerHTML = '▸';
            }
        });

        toggleAllBtn.innerHTML = allExpanded ? 'Collapse All' : 'Expand All';
    });
});
