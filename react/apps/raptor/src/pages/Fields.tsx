function CollectionName() {
    return(
        <div>Event</div>
    )
}

export default function Fields() {

    return(
        <section>
            <div>
                <h5>COLLECTION</h5>
                <CollectionName/>   
            </div>
            <h3>FIELDS</h3>
            <div>
                <h2>Output Files</h2>
                <article>
                    <ul>
                        <li>
                            <h3>Event.php</h3>
                        </li>
                        <li>
                            <h3>Migrate.php</h3>
                        </li>
                    </ul>
                </article>
            </div>
        </section>
    )

}