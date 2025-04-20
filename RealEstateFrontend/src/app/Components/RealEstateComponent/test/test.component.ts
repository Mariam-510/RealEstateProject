import { CommonModule } from '@angular/common';
import { Component, HostListener, ViewChild, ElementRef, AfterViewInit, Renderer2, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LeafletMapComponent } from '../../leaflet-map/leaflet-map.component';
import { PropertyPhotoModalComponent } from '../property-photo-modal/property-photo-modal.component';
// import { ModalDirective } from 'ngx-bootstrap/modal';

declare var bootstrap: any; // Required for Bootstrap modal handling
export interface Seller {
  name: string;
  imageUrl: string;
  phone: string;
  email: string;
  type: 'Seller' | 'Agent'; // or you can use string if it's more dynamic
}
export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  type: 'Sell' | 'Rent';
  price: number;
  status: 'Available' | 'Sold' | 'Auctioned';
  propertyCategory: string;
  area: number;
  postedDate:number;
  images: string[];
  agent: {
    id: number;
    name: string;
  };
  // Add other necessary fields
};

@Component({
  selector: 'app-test',
  imports: [CommonModule, LeafletMapComponent, RouterModule,PropertyPhotoModalComponent],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent  implements AfterViewInit {

  Math = Math;
  icons = [
    {
      src: 'icons/Bed.svg',
      alt: 'Bedroom Icon',
      value: '5',
      label: 'Bedrooms'
    },
    {
      src: 'icons/Bath.svg',
      alt: 'Bathroom Icon',
      value: '5',
      label: 'Bathrooms'
    },
    {
      src: 'icons/Area.svg',
      alt: 'Indoor Area Icon',
      value: '350 SqM',
      label: 'Indoor Area'
    },
    {
      src: 'icons/Complete.svg',
      alt: 'Completed Icon',
      value: 'Jan 2022',
      label: 'Completed'
    }
  ];
  
  showMore: boolean = false;
  seller: Seller = {
    name: 'Property Hills',
    imageUrl: 'details/d2.jpg',
    phone: '+1 234 567 8901',
    email: 'sarah@example.com',
    type: 'Agent',
    // type: 'Seller' 

  };

  property: Property = {
    id: 'U921376',
    title: "5 Bedroom Villa for sale at El Rehab Extension",
    description: "This spacious and stylish 5-bedroom villa offers the perfect blend of luxury, comfort, and modern design. Located in a prestigious neighborhood, the villa features expansive living areas, a fully equipped gourmet kitchen, and large windows that flood the space with natural light. Each of the five bedrooms is generously sized, including a master suite with a walk-in closet and a spa-like ensuite bathroom. Outside, you'll find a beautifully landscaped garden, a private swimming pool, and ample space for entertaining guests. Ideal for families or those who love to host, this villa provides a serene retreat while being conveniently close to schools, shops, and recreational facilities.",
    location: "6th of October",
    type: "Sell",
    price: 250000,
    status: "Available",
    propertyCategory: "Villa",
    area: 350,
    postedDate:7,
    images: [
      "details/property4.jpg",
      "details/property5.jpg"
    ],
    agent: {
      id: 5,
      name: "Marta Lazic"
    }
  };
  propertyFeatures = [
    {
      label: 'Bedrooms',
      value: 5,
      svg: `<svg aria-hidden="true" loading="lazy" width="55" height="48px" viewBox="0 0 55 55" fill="none">
                    <rect width="14.3925" height="8.2243" rx="4.11215" transform="matrix(-1 0 0 1 44.7196 17.9346)"
                      fill="#c38e79"></rect>
                    <rect width="14.3925" height="8.2243" rx="4.11215" transform="matrix(-1 0 0 1 24.6729 17.9346)"
                      fill="#c38e79"></rect>
                    <path
                      d="M0.916664 33.0296H1.83333V30.2796C1.83574 28.4593 2.915 26.813 4.58333 26.0849V11.9462C4.58356 11.5819 4.79943 11.2523 5.13333 11.1066C4.77571 10.5334 4.58528 9.87182 4.58333 9.19624C4.58333 7.17121 6.22497 5.52957 8.25 5.52957C10.275 5.52957 11.9167 7.17121 11.9167 9.19624C11.9129 9.8418 11.7369 10.4746 11.407 11.0296H43.593C43.2631 10.4746 43.0871 9.8418 
                                          43.0833 9.19624C43.0833 7.17121 44.725 5.52957 46.75 5.52957C48.775 5.52957 50.4167 7.17121 50.4167 9.19624C50.4147 9.87182 50.2243 10.5334 49.8667 11.1066C50.2006 11.2523 50.4164 11.5819 50.4167 11.9462V26.0849C52.085 26.813 53.1643 28.4593 53.1667 30.2796V33.0296H54.0833C54.5896 33.0296 55 33.44 55 33.9462V46.7796C55 47.2858 54.5896 47.6962 54.0833 47.6962H53.1667V52.2796C53.1667
                                           52.7858 52.7562 53.1962 52.25 53.1962H48.5833C48.0771 53.1962 47.6667 52.7858 47.6667 52.2796V47.6962H7.33333V52.2796C7.33333 52.7858 6.92289 53.1962 6.41666 53.1962H2.75C2.24377 53.1962 1.83333 52.7858 1.83333 52.2796V47.6962H0.916664C0.410435 47.6962 0 47.2858 0 46.7796V33.9462C0 33.44 0.410435 33.0296 0.916664 33.0296ZM8.25 7.36291C7.23743 7.36291 6.41666 8.18367 6.41666 9.19624C6.41666
                                            10.2088 7.23743 11.0296 8.25 11.0296C9.26257 11.0296 10.0833 10.2088 10.0833 9.19624C10.0833 8.18367 9.26257 7.36291 8.25 7.36291ZM46.75 7.36291C45.7374 7.36291 44.9167 8.18367 44.9167 9.19624C44.9167 10.2088 45.7374 11.0296 46.75 11.0296C47.7626 11.0296 48.5833 10.2088 48.5833 9.19624C48.5833 8.18367 47.7626 7.36291 46.75 7.36291ZM48.5833 12.8629H6.41666V25.6962H10.1072C9.50056 24.9076 9.16999
                                             23.9413 9.16666 22.9462V21.1129C9.16964 18.5829 11.22 16.5326 13.75 16.5296H21.0833C23.6133 16.5326 25.6637 18.5829 25.6667 21.1129V22.9462C25.6633 23.9413 25.3328 24.9076 24.7262 25.6962H30.2738C29.6672 24.9076 29.3367 23.9413 29.3333 22.9462V21.1129C29.3363 18.5829 31.3867 16.5326 33.9167 16.5296H41.25C43.78 16.5326 45.8304 18.5829 45.8333 21.1129V22.9462C45.83 23.9413 45.4994 24.9076 44.8928
                                              25.6962H48.5833V12.8629ZM11 21.1129V22.9462C11 24.465 12.2312 25.6962 13.75 25.6962H21.0833C22.6021 25.6962 23.8333 24.465 23.8333 22.9462V21.1129C23.8333 19.5941 22.6021 18.3629 21.0833 18.3629H13.75C12.2312 18.3629 11 19.5941 11 21.1129ZM31.1667 21.1129V22.9462C31.1667 24.465 32.3979 25.6962 33.9167 25.6962H41.25C42.7688 25.6962 44 24.465 44 22.9462V21.1129C44 19.5941 42.7688 18.3629 41.25 
                                              18.3629H33.9167C32.3979 18.3629 31.1667 19.5941 31.1667 21.1129ZM51.3333 30.2796C51.3333 28.7608 50.1021 27.5296 48.5833 27.5296H6.41666C4.89786 27.5296 3.66666 28.7608 3.66666 30.2796V33.0296H51.3333V30.2796ZM49.5 51.3629H51.3333V47.6962H49.5V51.3629ZM3.66666 51.3629H5.5V47.6962H3.66666V51.3629ZM1.83333 45.8629H53.1667V34.8629H1.83333V45.8629Z"
                      fill="black"></path>
                    <path
                      d="M46.75 42.1963H50.4167C50.9229 42.1963 51.3333 42.6067 51.3333 43.1129C51.3333 43.6191 50.9229 44.0296 50.4167 44.0296H46.75C46.2438 44.0296 45.8333 43.6191 45.8333 43.1129C45.8333 42.6067 46.2438 42.1963 46.75 42.1963Z"
                      fill="black"></path>
                    <path
                      d="M4.58334 42.1963H43.0833C43.5896 42.1963 44 42.6067 44 43.1129C44 43.6191 43.5896 44.0296 43.0833 44.0296H4.58334C4.07711 44.0296 3.66667 43.6191 3.66667 43.1129C3.66667 42.6067 4.07711 42.1963 4.58334 42.1963Z"
                      fill="black"></path>
                  </svg>` // Your bedroom SVG
    },
    {
      label: 'Bathrooms',
      value: 5,
      svg: `<svg height="48px" width="55px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"
                    transform="matrix(-1, 0, 0, 1, 0, 0)">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                      <g>
                        <g>
                          <path style="fill:#000000;"
                            d="M114.75,503.172c-1.324,0-2.675-0.3-3.937-0.927c-4.361-2.189-6.135-7.486-3.955-11.847 l17.655-35.31c2.189-4.352,7.477-6.118,11.847-3.955c4.361,2.189,6.135,7.486,3.955,11.847l-17.655,35.31 C121.106,501.389,117.99,503.172,114.75,503.172">
                          </path>
                          <path style="fill:#000000;"
                            d="M406.078,503.172c-3.24,0-6.356-1.783-7.91-4.882l-17.655-35.31 c-2.18-4.361-0.406-9.657,3.955-11.847c4.361-2.163,9.657-0.397,11.847,3.955l17.655,35.31c2.18,4.361,0.406,9.657-3.955,11.847 C408.753,502.872,407.402,503.172,406.078,503.172">
                          </path>
                        </g>
                        <path style="fill:black;"
                          d="M494.345,317.793H17.655C7.945,317.793,0,309.848,0,300.138c0-9.71,7.945-17.655,17.655-17.655 h476.69c9.71,0,17.655,7.945,17.655,17.655C512,309.848,504.055,317.793,494.345,317.793">
                        </path>
                        <path style="fill:#c38e79;"
                          d="M35.31,317.793H476.69l-25.282,101.12c-5.897,23.578-27.074,40.121-51.385,40.121H111.978 c-24.311,0-45.489-16.543-51.385-40.121L35.31,317.793z">
                        </path>
                        <path style="fill:#83c0ec;"
                          d="M158.897,247.172c-1.589,0-3.107,0.265-4.643,0.468c-6.047-10.761-17.443-18.123-30.667-18.123 c-17.832,0-32.424,13.259-34.816,30.429c-6.479-7.742-16.093-12.774-26.977-12.774c-19.5,0-35.31,15.81-35.31,35.31h167.724 C194.207,262.983,178.397,247.172,158.897,247.172">
                        </path>
                        <path style="fill:#000000;"
                          d="M485.517,282.483h-17.655V88.276c0-34.066-27.719-61.793-61.793-61.793 c-36.59,0-52.966,31.038-52.966,61.793h-17.655c0-46.777,29.043-79.448,70.621-79.448c43.803,0,79.448,35.637,79.448,79.448 V282.483z">
                        </path>
                        <g>
                          <path style="fill:#83c0ec;"
                            d="M308.966,172.138c-4.873,0-8.828-3.946-8.828-8.828v-4.414c0-4.882,3.955-8.828,8.828-8.828 s8.828,3.946,8.828,8.828v4.414C317.793,168.192,313.838,172.138,308.966,172.138">
                          </path>
                          <path style="fill:#83c0ec;"
                            d="M308.966,212.491c-4.873,0-8.828-3.946-8.828-8.828v-10.09c0-4.873,3.955-8.828,8.828-8.828 s8.828,3.955,8.828,8.828v10.09C317.793,208.546,313.838,212.491,308.966,212.491">
                          </path>
                          <path style="fill:#83c0ec;"
                            d="M308.966,247.172c-4.873,0-8.828-3.946-8.828-8.828v-4.414c0-4.882,3.955-8.828,8.828-8.828 s8.828,3.946,8.828,8.828v4.414C317.793,243.226,313.838,247.172,308.966,247.172">
                          </path>
                          <path style="fill:#83c0ec;"
                            d="M344.276,172.138c-4.873,0-8.828-3.946-8.828-8.828v-4.414c0-4.882,3.955-8.828,8.828-8.828 c4.873,0,8.828,3.946,8.828,8.828v4.414C353.103,168.192,349.149,172.138,344.276,172.138">
                          </path>
                          <path style="fill:#83c0ec;"
                            d="M344.276,212.491c-4.873,0-8.828-3.946-8.828-8.828v-10.09c0-4.873,3.955-8.828,8.828-8.828 c4.873,0,8.828,3.955,8.828,8.828v10.09C353.103,208.546,349.149,212.491,344.276,212.491">
                          </path>
                          <path style="fill:#83c0ec;"
                            d="M344.276,247.172c-4.873,0-8.828-3.946-8.828-8.828v-4.414c0-4.882,3.955-8.828,8.828-8.828 c4.873,0,8.828,3.946,8.828,8.828v4.414C353.103,243.226,349.149,247.172,344.276,247.172">
                          </path>
                          <path style="fill:#83c0ec;"
                            d="M379.586,172.138c-4.873,0-8.828-3.946-8.828-8.828v-4.414c0-4.882,3.955-8.828,8.828-8.828 c4.873,0,8.828,3.946,8.828,8.828v4.414C388.414,168.192,384.459,172.138,379.586,172.138">
                          </path>
                          <path style="fill:#83c0ec;"
                            d="M379.586,212.491c-4.873,0-8.828-3.946-8.828-8.828v-10.09c0-4.873,3.955-8.828,8.828-8.828 c4.873,0,8.828,3.955,8.828,8.828v10.09C388.414,208.546,384.459,212.491,379.586,212.491">
                          </path>
                          <path style="fill:#83c0ec;"
                            d="M379.586,247.172c-4.873,0-8.828-3.946-8.828-8.828v-4.414c0-4.882,3.955-8.828,8.828-8.828 c4.873,0,8.828,3.946,8.828,8.828v4.414C388.414,243.226,384.459,247.172,379.586,247.172">
                          </path>
                        </g>
                        <path style="fill:#000000;"
                          d="M379.586,132.414h-70.621c-4.873,0-8.828-3.946-8.828-8.828c0-24.338,19.8-44.138,44.138-44.138 s44.138,19.8,44.138,44.138C388.414,128.468,384.459,132.414,379.586,132.414">
                        </path>
                      </g>
                    </g>
                  </svg>` // Your bathroom SVG
    },
    {
      label: 'Indoor Area',
      value: '350 SqM',
      svg: ` <svg aria-hidden="true" loading="lazy" width="55" height="48" viewBox="0 0 55 55" fill="none">
                    <path d="M15 51.5H3.5V24.5H18V16" stroke="black" stroke-width="1.5" stroke-linecap="round"
                      stroke-linejoin="round"></path>
                    <path d="M18 12V4.5H50.5V37.5" stroke="black" stroke-width="1.5" stroke-linecap="round"
                      stroke-linejoin="round"></path>
                    <path d="M50.5 41V51.5H18.5" stroke="black" stroke-width="1.5" stroke-linecap="round"
                      stroke-linejoin="round"></path>
                    <path d="M21 8V24.5H32.5V28H28.5" stroke="black" stroke-width="1.5" stroke-linecap="round"
                      stroke-linejoin="round"></path>
                    <path d="M25.5 28H21V34H18V28H7.5V48H17.5V43.5H21.5V48H47V28H42.5V24.5H47V8H21" stroke="black"
                      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                    <mask id="path-6-inside-1_202_99" fill="white">
                      <rect x="33" y="8" width="11" height="13" rx="1"></rect>
                    </mask>
                    <rect x="33" y="8" width="11" height="13" rx="1" fill="#c38e79" stroke="black" stroke-width="2.4"
                      mask="url(#path-6-inside-1_202_99)"></rect>
                    <mask id="path-7-inside-2_202_99" fill="white">
                      <rect x="33" y="8" width="11" height="5" rx="1"></rect>
                    </mask>
                    <rect x="33" y="8" width="11" height="5" rx="1" fill="#c38e79" stroke="black" stroke-width="2.4"
                      mask="url(#path-7-inside-2_202_99)"></rect>
                    <mask id="path-8-inside-3_202_99" fill="white">
                      <path d="M21 11H26C26.5523 11 27 11.4477 27 12V21C27 21.5523 26.5523 22 26 22H21V11Z"></path>
                    </mask>
                    <path d="M21 11H26C26.5523 11 27 11.4477 27 12V21C27 21.5523 26.5523 22 26 22H21V11Z" fill="#c38e79"
                      stroke="black" stroke-width="2.4" mask="url(#path-8-inside-3_202_99)"></path>
                    <mask id="path-9-inside-4_202_99" fill="white">
                      <rect x="7" y="31" width="6" height="14" rx="1"></rect>
                    </mask>
                    <rect x="7" y="31" width="6" height="14" rx="1" fill="#c38e79" stroke="black" stroke-width="2.4"
                      mask="url(#path-9-inside-4_202_99)"></rect>
                    <mask id="path-10-inside-5_202_99" fill="white">
                      <rect x="29" y="44" width="15" height="4" rx="0.5"></rect>
                    </mask>
                    <rect x="29" y="44" width="15" height="4" rx="0.5" fill="#c38e79" stroke="black" stroke-width="2"
                      mask="url(#path-10-inside-5_202_99)"></rect>
                    <mask id="path-11-inside-6_202_99" fill="white">
                      <rect x="30" y="40" width="4" height="5" rx="0.5"></rect>
                    </mask>
                    <rect x="30" y="40" width="4" height="5" rx="0.5" fill="#c38e79" stroke="black" stroke-width="2"
                      mask="url(#path-11-inside-6_202_99)"></rect>
                    <mask id="path-12-inside-7_202_99" fill="white">
                      <rect x="39" y="40" width="4" height="5" rx="0.5"></rect>
                    </mask>
                    <rect x="39" y="40" width="4" height="5" rx="0.5" fill="#c38e79" stroke="black" stroke-width="2"
                      mask="url(#path-12-inside-7_202_99)"></rect>
                    <mask id="path-13-inside-8_202_99" fill="white">
                      <rect x="33" y="41" width="7" height="4" rx="0.5"></rect>
                    </mask>
                    <rect x="33" y="41" width="7" height="4" rx="0.5" fill="#c38e79" stroke="black" stroke-width="2"
                      mask="url(#path-13-inside-8_202_99)"></rect>
                    <line x1="38.5" y1="12" x2="38.5" y2="9" stroke="black"></line>
                    <path d="M22 43L28 36" stroke="black" stroke-width="1.2" stroke-linecap="round"
                      stroke-linejoin="round"></path>
                    <path d="M42 28L35 33" stroke="black" stroke-width="1.2" stroke-linecap="round"
                      stroke-linejoin="round"></path>
                  </svg>` // Your area SVG
    },
    {
      label: 'Completed',
      value: 'Jan 2022',
      svg: `<svg aria-hidden="true" loading="lazy" width="55" height="48" viewBox="0 0 55 55" fill="none">
                    <rect x="8" y="10" width="4" height="11" fill="#c38e79"></rect>
                    <path d="M43 32L44 30L45.5 30.5L46.5 32V34.5L43 34V32Z" fill="#c38e79"></path>
                    <path
                      d="M52.9038 19.1667L48.7371 10.8333C48.5704 10.5 48.3204 10.3333 47.9871 10.3333H24.7684C24.7129 10.328 24.6568 10.3282 24.6011 10.3333H24.3779L21.8204 2.5833C21.7371 2.25 21.4037 2 21.0704 2H18.3204C17.9037 2 17.5704 2.25 17.4871 2.5833L14.9296 10.3333H12.9871V9.5C12.9871 9 12.6538 8.6667 12.1538 8.6667H7.98712C7.48712 8.6667 7.15382 9 7.15382 9.5V12H3.82042C3.32042 12 2.98712 12.3333 2.98712 12.8333V14.5C2.98712 16.8333 4.82042 18.6667 7.15382 18.6667V21.1667C7.15382 21.6667 7.48712 22 7.98712 22H12.1538C12.6538 22 12.9871 21.6667 12.9871 21.1667V20.3334H14.6538V50.3334H9.65382C9.15382 50.3334 8.82052 50.6667 8.82052 51.1667C8.82052 51.6667 9.15382 52 9.65382 52H15.4871H23.8204H33.8204C34.3204 52 34.6537 51.6667 34.6537 51.1667C34.6537 50.6667 34.3204 50.3334 33.8204 50.3334H24.6537V20.3334H43.8204V29.166C42.7322 30.3146 42.1537 31.8709 42.1537 33.5001V34.5001C42.1537 35.0001 42.487 35.3334 42.987 35.3334H43.8203V37.0001C43.8203 37.5001 44.1536 37.8334 44.6536 37.8334C45.5703 37.8334 46.3203 38.5834 46.3203 39.5001C46.3203 40.4168 45.5703 41.1668 44.6536 41.1668C43.7369 41.1668 42.9869 40.4168 42.9869 39.5001C42.9869 39.0001 42.6536 38.6668 42.1536 38.6668C41.6536 38.6668 41.3203 39.0001 41.3203 39.5001C41.3203 41.3334 42.8203 42.8334 44.6536 42.8334C46.4869 42.8334 47.9869 41.3334 47.9869 39.5001C47.9869 37.9543 46.9204 36.6454 45.4869 36.2729V35.3334H46.3202C46.8202 35.3334 47.1535 35.0001 47.1535 34.5001V33.5001C47.1535 31.871 46.5751 30.3866 45.4868 29.1809V20.3334H52.1535C52.4868 20.3334 52.7368 20.1667 52.9035 20.0001C52.9871 19.75 53.0704 19.4167 52.9038 19.1667ZM48.3983 13.8222L44.7092 18.2358L42.3871 15.3333L45.0538 12H47.4871L48.3983 13.8222ZM18.2014 14.0833L16.3204 15.4V12.7667L18.2014 14.0833ZM39.7204 12H42.9204L41.3204 14L39.7204 12ZM40.2538 15.3333L37.9871 18.1667L35.7204 15.3334L37.9871 12.5001L40.2538 15.3333ZM34.6538 14L33.0538 12H36.2538L34.6538 14ZM33.5871 15.3333L31.3204 18.1666L29.0537 15.3333L31.3204 12.5L33.5871 15.3333ZM27.9871 14L26.3871 12H29.5871L27.9871 14ZM22.9871 15.4L21.1062 14.0833L22.9871 12.7666V15.4ZM22.4316 17.0444L19.6538 19.2666L16.8761 17.0443L19.6538 15.0999L22.4316 17.0444ZM16.3204 19.5V18.7333L18.3204 20.3333L16.3204 21.9333V19.5ZM20.9871 40.3333L22.9871 38.7333V41.9333L20.9871 40.3333ZM22.5704 43.75L19.7417 46.299L16.8204 43.6667L19.6474 41.4052L22.5704 43.75ZM22.9871 32.0667V35.2667L20.9871 33.6667L22.9871 32.0667ZM19.6538 32.6L16.8205 30.3333L19.6538 28.0666L22.4871 30.3333L19.6538 32.6ZM22.4871 37L19.6538 39.2667L16.8205 37L19.6538 34.7333L22.4871 37ZM22.9871 28.6L20.9871 27L22.9871 25.4V28.6ZM19.6538 25.9333L16.8205 23.6666L19.6538 21.3999L22.4871 23.6666L19.6538 25.9333ZM18.3204 27L16.3204 28.6V25.4L18.3204 27ZM18.3204 33.6667L16.3204 35.2667V32.0667L18.3204 33.6667ZM18.3158 40.337L16.3204 41.9334V38.7363L18.3158 40.337ZM18.4618 47.4522L16.3204 49.3818V45.525L18.4618 47.4522ZM19.7001 48.5667L21.6631 50.3334H17.7371L19.7001 48.5667ZM20.98 47.4147L22.9871 45.6083V49.2234L20.98 47.4147ZM22.9871 19.5V21.9333L20.9871 20.3333L22.9871 18.7333V19.5ZM24.6538 17.1954C24.7054 17.0358 24.7039 16.8761 24.6538 16.7314V12.5L26.9205 15.3333L24.6538 18.1666V17.1954ZM29.5871 18.6667H26.3871L27.9871 16.6667L29.5871 18.6667ZM34.6538 16.6667L36.2538 18.6667H33.0538L34.6538 16.6667ZM41.3204 16.6667L42.9204 18.6667H39.7204L41.3204 16.6667ZM18.9038 3.6667H20.4871L22.8279 10.8449L19.6538 13.0668L16.4841 10.8479L18.9038 3.6667ZM4.65382 14.5V13.6667H7.15382V17C5.73712 17 4.65382 15.9167 4.65382 14.5ZM11.3204 20.3333H8.82042V17.8333V12.8333V10.3333H11.3204V11.1666V19.4999V20.3333ZM12.9871 18.6667V12H14.6538V18.6667H12.9871ZM45.4871 33.6667H43.8204V33.5C43.8204 32.5 44.0704 31.5833 44.6537 30.75C45.237 31.5833 45.487 32.5 45.487 33.5L45.4871 33.6667ZM46.5045 18.6667L49.205 15.4357L50.8204 18.6667H46.5045Z"
                      fill="black"></path>
                  </svg>` // Your completion date SVG
    }
  ];
  @ViewChild(PropertyPhotoModalComponent) photosModalComp!: PropertyPhotoModalComponent;

  openPhotosModal() {
    this.photosModalComp.openModal();
  }

  // Reference to the navigation button group
  @ViewChild('tabLinks') tabLinks!: ElementRef;

  sections!: NodeListOf<HTMLElement>;
  stopSection!: HTMLElement;
  isNavigationSticky: boolean = false;
  currentActiveSection: string = 'overview';
  private initialCardTop = 0;
  private stickyThreshold = 0;
  @ViewChild('heroSection') heroSection!: ElementRef;
  @ViewChild('buyNowCard') eventCard!: ElementRef;
  constructor(private renderer: Renderer2, private elRef: ElementRef) { }

  private tabLinksOffsetTop = 20;
  isFavorited: boolean = false;  // Track the state of the favorite

  toggleFavorite() {
    this.isFavorited = !this.isFavorited;
    console.log("Favorite status: ", this.isFavorited);

  }
  private calculateInitialPosition(): void {
    const hero = this.heroSection.nativeElement;
    const card = this.eventCard.nativeElement;
    this.stickyThreshold = hero.offsetTop + hero.offsetHeight - card.offsetHeight;

    const tabLinksWrapper = this.tabLinks?.nativeElement?.parentElement;

    if (tabLinksWrapper) {
      const rect = tabLinksWrapper.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      this.tabLinksOffsetTop += rect.top + scrollTop;
    } else {
      this.tabLinksOffsetTop = 0;
    }
  }
  ngAfterViewInit(): void {
    this.calculateInitialPosition();
    this.sections = this.elRef.nativeElement.querySelectorAll('section');
    this.stopSection = this.elRef.nativeElement.querySelector('#stop-scroll');
  }



  private lastScrollTop: number = 0;
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // console.log("inside wssssssssssssssssssssssssssss");
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const card = this.eventCard.nativeElement;

    // Handle tab bar stickiness
    if (!this.tabLinks || !this.tabLinks.nativeElement) return;
    // console.log("222222222222inside wssssssssssssssssssssssssssss");

    let scrollPosition = scrollY ;
    const tabBar = this.tabLinks.nativeElement;
    const tabBarOffset = tabBar.offsetTop;
    const cardOffest= card.offsetTop;
    let flag = true;
    let cardflag=true;
    // Detect Scroll Direction
    const scrollingDown = (scrollY) > this.lastScrollTop;
    // console.log(card.offsetHeight);

    // Stop scrolling effect at "YOU MIGHT ALSO LIKE"
    if (this.stopSection) {
      const stopPoint = this.stopSection.offsetTop;

      if (scrollingDown) {
        //card
        if (scrollPosition >= stopPoint) {
          this.renderer.removeClass(card, 'fixed-event-card');
          // this.renderer.setStyle(card, 'position', 'absolute');
          this.renderer.setStyle(card, 'top', `${stopPoint - card.offsetHeight }px`);
          // console.log('card-----------------------------------------');
        }
        else {
          // if(scrollY>=cardOffest)
          this.renderer.addClass(card, 'fixed-event-card');
          // console.log('card************************************************');
        }
      }
      //card
      if (!scrollingDown && scrollPosition < stopPoint ) {
        this.renderer.addClass(card, 'fixed-event-card');
        // console.log('card#################################################');
      }

      //tabBar
      if (scrollingDown && scrollY >= tabBarOffset && flag ) {
        tabBar.classList.add('sticky');
        // console.log('///////////////////////////////////////////////////');
  
      }
      else if (!scrollingDown && scrollY <= tabBarOffset + 500) {
        flag = true;
        tabBar.classList.remove('sticky'); // Return to original position when scrolling up
        // console.log('####################################################');
  
      }

       //tabBar
       if (scrollingDown && scrollPosition >= stopPoint+100) {
        flag = false;
        this.renderer.removeClass(card, 'fixed-event-card');    
        // console.log('---------------------------------');
      }

      //tabBar
      else if (!scrollingDown && scrollPosition < stopPoint-100) {
        flag = true;
        this.renderer.addClass(card, 'fixed-event-card');    
        // console.log('**************************************');

      }
    }

    // Keep tabBar sticky only when scrolling down and past the tabBar's original position
    //tabBar
    if (scrollingDown && scrollY >= tabBarOffset-200 ) {
      tabBar.classList.add('sticky');
      
      // console.log('///////////////////////////////////////////////////');

    }
    else if (!scrollingDown && scrollY <= tabBarOffset + 450) {
      flag = true;
      tabBar.classList.remove('sticky'); // Return to original position when scrolling up
      // console.log('####################################################');

    }

  //new card
  // if (scrollingDown && scrollY >= cardOffest-100 ) {
  //   this.renderer.addClass(card, 'fixed-event-card');
  //   console.log('///////////////////////////////////////////////////');

  // }
  //  //new card
  // else if (!scrollingDown && scrollY <= cardOffest + 500) {
  //   this.renderer.removeClass(card, 'fixed-event-card'); // Return to original position when scrolling up
  //   console.log('####################################################');

  // }


    
    if (scrollingDown && scrollY >= cardOffest-500) {
      this.renderer.addClass(card, 'fixed-event-card');      
      // console.log('///////////////////////////////////////////////////');

    }
    if(!scrollingDown && scrollY <= cardOffest+100){
      this.renderer.removeClass(card, 'fixed-event-card');
      // console.log('fixed removeddddddddddddddddddddddddddddcard-----------------------------------------');
    }

    // Change active tab based on scroll
    this.sections.forEach((section) => {
      if (
        scrollPosition >= section.offsetTop - 50 &&
        scrollPosition < section.offsetTop + section.offsetHeight && scrollingDown
      ) {
        this.setActiveTab(section.id);
        // console.log("*************************************");
      }

      if (
        scrollPosition >= section.offsetTop - 250 &&
        scrollPosition < section.offsetTop + section.offsetHeight && !scrollingDown
      ) {
        this.setActiveTab(section.id);
        // console.log("---------------------------------------------");
      }
    });

    this.lastScrollTop = scrollY; // Update last scroll position
  }







  scrollToSection(event: Event, sectionId: string) {
    event.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private setActiveTab(activeId: string) {
    const tabs = this.tabLinks.nativeElement.querySelectorAll('a');
    tabs.forEach((tab: HTMLElement) => {
      tab.classList.remove('active');
      if (tab.getAttribute('href')?.includes(activeId)) {
        tab.classList.add('active');
      }
    });
  }

  isMapVisible: boolean = true;

  toggleMap() {
    this.isMapVisible = !this.isMapVisible;
  }
  locationUrl: string = 'cairo, Egypt';

 

  openShareModal() {
    this.locationUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.property.location)}`;

    // Open Bootstrap Modal
    const modalElement = document.getElementById('shareLocationModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
 

  copyToClipboard() {
    navigator.clipboard.writeText(this.locationUrl);
  }

}