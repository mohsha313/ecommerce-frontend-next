import { CartContext } from "@/lib/CartContext";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";
import { translate }from '../../Utils/LanguageUtils.js';
import  LanguageContext  from "../../context/_LanguageContext.js";
import { useRouter } from "next/router.js";

import Image from 'next/image';

// Utility function to format price with a comma for thousands
const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function Products({ allProducts }) {
  const router = useRouter();
  const {  changeLanguage } = useContext(LanguageContext);
  const { language } = useContext(LanguageContext)
  const { addProduct } = useContext(CartContext);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(allProducts);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const filterProducts = () => {
    if (searchQuery === "") {
      setFilteredProducts(allProducts);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = allProducts.filter((product) =>
        product.title.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredProducts(filtered);
    }
  };

  useEffect(() => {
    filterProducts();
  }, [searchQuery]);

  return (
    <div className="flex justify-center min-h-screen w-full">
      {loading ? (
        <div className="flex justify-center items-center min-h-screen w-full">
          <Spinner />
        </div>
      ) : (
        <div className="mt-14 md:mt-6 w-full px-4 md:p-0">
          <input
            type="text"
            placeholder="Search products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4 px-4 py-2 rounded-lg border border-gray-300 w-full" // Increased the input size
          />

          {filteredProducts.length === 0 ? ( // Display a message when no matching searches
            <p className="text-center text-gray-600">
              {translate('no_data', language)}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 md:gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 xl:gap-x-8 px-2">
              {filteredProducts.map((product) => (
                <div key={product._id}>
                  <div className="group block overflow-hidden border border-accent rounded-xl border-opacity-10">
                    <div className="">
                      <div className="relative md:h-[300px] h-[200px]">
                        <Image
                          src={product.images[0]}
                          alt=""
                          className="absolute inset-0 h-full w-full object-contain opacity-100 group-hover:opacity-0"
                          width={800} 
                          height={600}
                        />
                        <Image
                          src={product.images[1]}
                          alt=""
                          className="absolute inset-0 h-full w-full object-contain opacity-0 group-hover:opacity-100"
                          width={800} 
                          height={600}
                        />
                      </div>

                      <div className="relative p-3 border-t">
                        <Link href={"/products/" + product._id}>
                          <h3 className="text-md text-gray-700 group-hover:underline group-hover:underline-offset-4 truncate">
                            {product.title}
                          </h3>
                        </Link>

                        <div className="mt-1.5 flex flex-col items-center justify-between text-text">
                          <p className="tracking-wide text-primary text-sm md:text-md">
                          Euro. {formatPrice(product.price)}
                          </p>

                          <div className="col-span-12 text-center w-full mt-3">
                            <button
                              onClick={() => {
                                addProduct(product._id);
                                toast.success("Item added to cart!");
                              }}
                              className="disabled block rounded bg-secondary px-5 py-3 text-md text-text w-full transition hover:bg-purple-300"
                            >
                              {translate('Add_tocart', language)}
                              
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps() {
  await mongooseConnect();
  const allProducts = await Product.find({}, null, { sort: { _id: 1 } });

  return {
    props: {
      allProducts: JSON.parse(JSON.stringify(allProducts)),
    },
  };
}


