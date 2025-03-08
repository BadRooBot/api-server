document.addEventListener('DOMContentLoaded', function() {
  // Check for saved theme preference or use preferred color scheme
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Apply dark mode if saved or preferred
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-mode');
    updateThemeIcon(true);
  }
  
  // Add theme toggle button to the page
  const toggleButton = document.createElement('div');
  toggleButton.className = 'theme-toggle';
  toggleButton.setAttribute('aria-label', 'تبديل الوضع المظلم');
  toggleButton.setAttribute('title', 'تبديل الوضع المظلم');
  
  // Set initial icon based on current theme
  toggleButton.innerHTML = document.body.classList.contains('dark-mode') ? 
    '<i class="fas fa-sun"></i>' : 
    '<i class="fas fa-moon"></i>';
  
  // Add tooltip text
  const tooltip = document.createElement('span');
  tooltip.className = 'theme-toggle-tooltip';
  tooltip.textContent = document.body.classList.contains('dark-mode') ? 'الوضع المضيء' : 'الوضع المظلم';
  toggleButton.appendChild(tooltip);
  
  document.body.appendChild(toggleButton);
  
  // Toggle theme on button click
  toggleButton.addEventListener('click', function() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateThemeIcon(isDarkMode);
  });
  
  // Update the icon based on current theme
  function updateThemeIcon(isDarkMode) {
    const toggleButton = document.querySelector('.theme-toggle');
    const tooltip = document.querySelector('.theme-toggle-tooltip');
    
    if (toggleButton) {
      toggleButton.innerHTML = isDarkMode ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
      
      // Re-add tooltip
      if (tooltip) {
        tooltip.textContent = isDarkMode ? 'الوضع المضيء' : 'الوضع المظلم';
      } else {
        const newTooltip = document.createElement('span');
        newTooltip.className = 'theme-toggle-tooltip';
        newTooltip.textContent = isDarkMode ? 'الوضع المضيء' : 'الوضع المظلم';
        toggleButton.appendChild(newTooltip);
      }
    }
  }
}); 