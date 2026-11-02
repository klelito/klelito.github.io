// Personal data of the site owner.
// `cv: null` hides every "Download CV" button; set { pl, en } paths under public/ to enable downloads.
type CvLinks = { pl: string; en: string } | null;

export const SITE: {
  url: string;
  name: string;
  email: string;
  linkedin: string;
  github: string;
  cv: CvLinks;
} = {
  url: 'https://klelito.github.io',
  name: 'Kacper Lelito',
  email: 'klelito.business@gmail.com',
  linkedin: 'https://www.linkedin.com/in/kacper-lelito',
  github: 'https://github.com/klelito',
  cv: null,
};
