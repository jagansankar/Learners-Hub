// chapterView/index.jsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';
import Button from "../../components/Shared/Button";
import Colors from '../../constant/Colors';
import { markChapterComplete } from '../../utils/enrollmentUtils';

export default function ChapterView() {
    const { chapterParams, docId, chapterIndex, userId, enroll } = useLocalSearchParams();
    const chapters = JSON.parse(chapterParams);
    const [currentPage, setCurrentPage] = useState(0);
    const [loader, setLoader] = useState(false);
    const router = useRouter();

    console.log('chapterView params:', { chapterIndex, docId, userId, enroll });

    const GetProgress = (currentPage) => {
        return currentPage / (chapters?.content?.length || 1);
    };

    const onChapterComplete = async () => {
        if (!docId || !userId) {
            console.error('Missing docId or userId! Cannot update chapter completion.');
            return;
        }
        
        setLoader(true);
        try {
            const success = await markChapterComplete(
                userId, 
                docId, 
                parseInt(chapterIndex), 
                chapters.content.length
            );
            
            if (success) {
                console.log('Chapter completion updated successfully');
                router.replace('/courseView/' + docId);
            } else {
                console.error('Failed to update chapter completion');
            }
        } catch (error) {
            console.error('Error updating chapter completion:', error);
        } finally {
            setLoader(false);
        }
    };

    return (
        <View
            style={{
                padding: 25,
                marginTop: 25,
                backgroundColor: Colors.WHITE,
                flex: 1,
            }}
        >
            <Progress.Bar progress={GetProgress(currentPage)} width={Dimensions.get('screen').width * 0.85} />

            <View style={{ marginTop: 20 }}>
                <Text style={{ fontFamily: 'outfit-bold', fontSize: 25 }}>{chapters?.content[currentPage]?.topic}</Text>

                <Text style={{ fontFamily: 'outfit', fontSize: 20, marginTop: 7 }}>{chapters?.content[currentPage]?.explain}</Text>

                {chapters?.content[currentPage]?.code && (
                    <Text style={[styles.codeExampleText, { backgroundColor: Colors.BLACK, color: Colors.WHITE }]}>
                        {chapters?.content[currentPage]?.code}
                    </Text>
                )}

                {chapters?.content[currentPage]?.example && (
                    <Text style={styles.codeExampleText}>{chapters?.content[currentPage]?.example}</Text>
                )}
            </View>

            <View style={{ position: 'absolute', bottom: 15, width: '100%', left: 25 }}>
                {chapters?.content?.length - 1 !== currentPage ? (
                    <Button text={'Next'} onPress={() => setCurrentPage(currentPage + 1)} />
                ) : (
                    <Button text={'Finish'} onPress={onChapterComplete} loading={loader} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    codeExampleText: {
        padding: 15,
        backgroundColor: Colors.BG_GRAY,
        borderRadius: 15,
        fontFamily: 'outfit',
        fontSize: 18,
        marginTop: 10,
    },
});