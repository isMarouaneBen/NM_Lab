  const navLinks = document.querySelectorAll('.nav-menu .nav-link');
  const menuOpenButton = document.querySelector('#menu-open-button');
  const menuCloseButton = document.querySelector('#menu-close-button');

   
    menuOpenButton.addEventListener('click', () => {
      document.body.classList.toggle('show-mobile-menu');
    });

    menuCloseButton.addEventListener('click', () => {
      document.body.classList.toggle('show-mobile-menu');
    });
    //close menu when the nav link is clicked
    navLinks.forEach((link) => {
      link.addEventListener('click', () => menuCloseButton.click())
    });
