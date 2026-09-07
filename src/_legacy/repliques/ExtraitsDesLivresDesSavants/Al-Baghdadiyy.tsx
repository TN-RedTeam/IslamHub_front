import React, { useState } from 'react';

const AlBaghdadiyy: React.FC = () => {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = [
        {
            src: "./public/img/Al-Baghdadiyy.jpg", // Chemin depuis la racine public/
            alt: "Page du manuscrit Al-Baghdadiyy 1",
            width: 558,
            height: 768
        },
        {
            src: "./public/img/Al-Baghdadiyy2.jpg",
            alt: "Page du manuscrit Al-Baghdadiyy 2",
            width: 558,
            height: 768
        }
    ];

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setIsLightboxOpen(true);
    };
    return (
     <div className="space-y-12">
            {/* Section 1 : L'existence */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">
                    Extrait  
                    <b> Livre:</b> Al-Farqou bayna l-firaq
                    <p><b>Auteur</b>: Abou Mansour Al-Baghdadiyy</p>
                </h2>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 my-6">
                    {images.map((image, index) => (
                        <div 
                            key={index}
                            className="relative w-full sm:w-1/2 max-w-md overflow-hidden rounded-lg shadow-lg cursor-zoom-in"
                            onClick={() => openLightbox(index)}
                        >
                            {/* Image avec taille optimisée */}
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105"
                                loading="lazy"
                                style={{ 
                                    maxHeight: '400px', // Limite la hauteur pour l'affichage initial
                                    width: 'auto' 
                                }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300"></div>
                        </div>
                    ))}
                </div>

                
                
                <p className="font-amiri text-gray-600 dark:text-gray-300 text-2xl text-center my-4">
Al-Bayhaqiyy a dit : "Certains de nos compagnons ont pris pour argument concernant l'exemption de l'endroit au sujet de Allah, la parole du Prophète salla l-Lahou ^alayhi wa sallam :"                </p>

                <p className="font-amiri text-gray-600 dark:text-gray-300 text-2xl text-center my-4">
أَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَىْءٌ وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُونَكَ شَىْءٌ                </p>
                <p className="font-amiri text-gray-600 dark:text-gray-300 text-2xl text-center my-4">
('anta dh-dhahirou falayça fawqaka chay' ; wa 'anta l-batinou falayça dounaka chay') 
                </p>
                <p className="font-amiri text-gray-600 dark:text-gray-300 text-2xl text-center my-4">
ce qui signifie : "Tu es Adh-Dhahir, rien n'est au dessus de Toi ; et Tu es Al-Batin, rien n'est en dessous de Toi". Et s'il n'y a rien au-dessus de Lui et rien au-dessous de Lui, Il n'est donc pas dans un endroit." Fin de citation.                </p>
                
            </div>

          
            {/* Lightbox simple */}
            {isLightboxOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <div className="relative max-w-full max-h-full">
                        <img
                            src={images[currentImageIndex].src}
                            alt={images[currentImageIndex].alt}
                            className="max-w-full max-h-screen object-contain"
                            style={{ maxHeight: '90vh' }}
                        />
                        <button 
                            className="absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsLightboxOpen(false);
                            }}
                            aria-label="Fermer la lightbox"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlBaghdadiyy;